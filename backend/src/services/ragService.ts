import { spawn } from 'child_process';
import { logger } from '../utils/logger';
import { db } from './database';

export interface QueryOptions {
  maxSources?: number;
  includeMetadata?: boolean;
  temperature?: number;
}

export interface RAGResult {
  answer: string;
  sources: Array<{
    content: string;
    page: number;
    score: number;
    category?: string;
  }>;
  metadata: {
    category: string;
    methods: string[];
    queryTime: number;
    chunksProcessed: number;
  };
}

export interface RAGStats {
  totalChunks: number;
  categories: string[];
  averageQueryTime: number;
  totalQueries: number;
  systemHealth: 'healthy' | 'degraded' | 'error';
}

export class RAGService {
  private pythonProcess: any = null;
  private isInitialized = false;
  private queryCount = 0;
  private totalQueryTime = 0;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      logger.info('Initializing RAG service...');
      
      // Test Python environment
      await this.testPythonEnvironment();
      
      this.isInitialized = true;
      logger.info('RAG service initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize RAG service:', error);
      throw error;
    }
  }

  private async testPythonEnvironment(): Promise<void> {
    return new Promise((resolve, reject) => {
      const testProcess = spawn('python', ['-c', 'import sys; print("Python OK")'], {
        cwd: '..',
        stdio: 'pipe'
      });

      let output = '';
      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.on('close', (code) => {
        if (code === 0 && output.includes('Python OK')) {
          resolve();
        } else {
          reject(new Error('Python environment test failed'));
        }
      });

      testProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  async query(question: string, options: QueryOptions = {}, userId?: string): Promise<RAGResult> {
    if (!this.isInitialized) {
      throw new Error('RAG service not initialized');
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Create Python script to run RAG query
      const pythonScript = `
import sys
import json
import os
sys.path.append('${process.cwd()}/..')
from rag_engine import OptimizedEnhancedRAG

try:
    # Initialize RAG
    rag = OptimizedEnhancedRAG()
    rag.setup()
    
    # Query
    question = """${question.replace(/"/g, '\\"')}"""
    result = rag.optimized_query(question)
    
    # Format response
    response = {
        "success": True,
        "answer": result["answer"],
        "sources": [
            {
                "content": chunk["content"][:500] + ("..." if len(chunk["content"]) > 500 else ""),
                "page": chunk["metadata"]["page"],
                "score": chunk.get("final_score", chunk.get("score", 0)),
                "category": chunk["metadata"].get("category", "general")
            }
            for chunk in result["relevant_chunks"][:${options.maxSources || 5}]
        ],
        "metadata": {
            "category": result.get("category_hint", "general"),
            "methods": result.get("methods", []),
            "queryTime": result.get("query_time", 0),
            "chunksProcessed": len(result["relevant_chunks"])
        }
    }
    
    print("RESULT_START")
    print(json.dumps(response))
    print("RESULT_END")
    
except Exception as e:
    error_response = {
        "success": False,
        "error": str(e),
        "type": type(e).__name__
    }
    print("ERROR_START")
    print(json.dumps(error_response))
    print("ERROR_END")
`;

      // Execute Python script
      const pythonProcess = spawn('python', ['-c', pythonScript], {
        cwd: '..',
        stdio: 'pipe',
        env: { ...process.env, PYTHONPATH: '.' }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        this.queryCount++;
        this.totalQueryTime += duration;

        logger.info('Python RAG process completed', {
          code,
          duration: `${duration}ms`,
          stdoutLength: stdout.length,
          stderrLength: stderr.length
        });

        try {
          // Extract result from stdout
          const resultMatch = stdout.match(/RESULT_START\n(.*)\nRESULT_END/s);
          const errorMatch = stdout.match(/ERROR_START\n(.*)\nERROR_END/s);

          if (errorMatch) {
            const errorData = JSON.parse(errorMatch[1]);
            reject(new Error(`RAG Error: ${errorData.error}`));
            return;
          }

          if (resultMatch) {
            const result = JSON.parse(resultMatch[1]);
            if (result.success) {
              // Save query to database
              this.saveQuery(question, result, duration, userId).catch(error => {
                logger.error('Failed to save query to database:', error);
              });
              
              resolve(result as RAGResult);
            } else {
              reject(new Error('RAG query failed'));
            }
          } else {
            reject(new Error('No valid result found in Python output'));
          }

        } catch (parseError) {
          logger.error('Failed to parse Python output:', {
            error: parseError,
            stdout: stdout.substring(0, 500),
            stderr: stderr.substring(0, 500)
          });
          reject(new Error('Failed to parse RAG response'));
        }
      });

      pythonProcess.on('error', (error) => {
        logger.error('Python process error:', error);
        reject(error);
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('RAG query timeout'));
      }, 60000);
    });
  }

  async getStats(): Promise<RAGStats> {
    return {
      totalChunks: 397, // From our knowledge base
      categories: ['speed_limits', 'traffic_rules', 'safety', 'licensing', 'general'],
      averageQueryTime: this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
      totalQueries: this.queryCount,
      systemHealth: this.isInitialized ? 'healthy' : 'error'
    };
  }

  async getCategories(): Promise<string[]> {
    return [
      'Speed Limits',
      'Traffic Rules', 
      'Safety',
      'Licensing',
      'General'
    ];
  }

  async getSuggestions(): Promise<string[]> {
    return [
      "What is the speed limit on highways in Ontario?",
      "What documents do I need for a G1 test?",
      "Can G1 drivers drive on 400-series highways?",
      "What is the blood alcohol limit for drivers?",
      "What should you do when a school bus has flashing red lights?",
      "What are the penalties for distracted driving?",
      "How do I renew my driver's license?",
      "What are the rules for motorcycle licensing?",
      "What should I do in case of an accident?",
      "What are the parking rules in Ontario?"
    ];
  }

  private async saveQuery(question: string, result: any, duration: number, userId?: string): Promise<void> {
    try {
      await db.query.create({
        data: {
          userId,
          question,
          answer: result.answer,
          sources: result.sources,
          metadata: {
            ...result.metadata,
            duration,
            timestamp: new Date().toISOString(),
          }
        }
      });
    } catch (error) {
      logger.error('Error saving query to database:', error);
    }
  }
}