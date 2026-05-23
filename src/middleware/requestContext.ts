import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startedAt?: number;
    }
  }
}

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const incomingRequestId = req.header('x-request-id');
  req.requestId = incomingRequestId || crypto.randomUUID();
  req.startedAt = Date.now();

  res.setHeader('x-request-id', req.requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - (req.startedAt || Date.now());
    logger.info('request_completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: (req as any).user?._id,
    });
  });

  next();
};
