import { Router } from 'express';
import { logger } from '../utils/logger';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
    },
    services: {
      rag_engine: 'operational',
      vector_db: 'operational',
      grok_api: process.env.XAI_API_KEY ? 'configured' : 'not_configured'
    }
  };

  logger.info('Health check requested', { 
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    data: healthCheck
  });
});

healthRouter.get('/ready', (req, res) => {
  // More thorough readiness check
  const isReady = !!(
    process.env.XAI_API_KEY &&
    process.env.NODE_ENV
  );

  if (isReady) {
    res.json({
      success: true,
      message: 'Service is ready to handle requests'
    });
  } else {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_NOT_READY',
        message: 'Service is not ready to handle requests',
        details: {
          xai_api_configured: !!process.env.XAI_API_KEY,
          environment_set: !!process.env.NODE_ENV
        }
      }
    });
  }
});