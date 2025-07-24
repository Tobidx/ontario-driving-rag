import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { RAGService } from '../services/ragService';

export const ragRouter = Router();

// Initialize RAG service
const ragService = new RAGService();

// Validation schemas
const querySchema = z.object({
  question: z.string()
    .min(1, 'Question cannot be empty')
    .max(1000, 'Question too long (max 1000 characters)'),
  options: z.object({
    maxSources: z.number().min(1).max(10).optional().default(5),
    includeMetadata: z.boolean().optional().default(true),
    temperature: z.number().min(0).max(1).optional().default(0.05)
  }).optional().default({})
});

// Query endpoint
ragRouter.post('/query', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request
    const { question, options } = querySchema.parse(req.body);
    
    logger.info('RAG query received', {
      question: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
      options,
      ip: req.ip
    });

    const startTime = Date.now();
    
    // Process query
    const result = await ragService.query(question, options);
    
    const duration = Date.now() - startTime;
    
    logger.info('RAG query completed', {
      duration: `${duration}ms`,
      sourcesFound: result.sources.length,
      category: result.metadata.category
    });

    // Response
    res.json({
      success: true,
      data: {
        question,
        answer: result.answer,
        sources: result.sources,
        metadata: {
          ...result.metadata,
          duration,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
      return;
    } else {
      next(error);
      return;
    }
  }
});

// Stats endpoint
ragRouter.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await ragService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
});

// Categories endpoint
ragRouter.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await ragService.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    next(error);
  }
});

// Search suggestions endpoint
ragRouter.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suggestions = await ragService.getSuggestions();
    
    res.json({
      success: true,
      data: suggestions
    });
    
  } catch (error) {
    next(error);
  }
});