import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Determine error type based on characteristics
  let errorType = 'ServerError';
  let statusCode = err.statusCode || res.statusCode || 500;
  
  if (statusCode === 200) statusCode = 500; // default to 500 if unhandled

  if (err.name === 'ZodError') {
    errorType = 'ValidationError';
    statusCode = 400;
  } else if (err.name === 'ValidationError') {
    errorType = 'ValidationError'; // Mongoose
    statusCode = 400;
  } else if (err.message && err.message.includes('Not authorized')) {
    errorType = 'AuthError';
    statusCode = 401;
  } else if (statusCode === 403) {
    errorType = 'AuthError';
  } else if (err.type === 'RateLimitError') {
    errorType = 'RateLimitError';
    statusCode = 429;
  }

  const message = err.message || 'Internal Server Error';

  // Log the error
  if (statusCode >= 500) {
    logger.error(`${errorType}: ${message}`, { stack: err.stack, path: req.path });
  } else {
    logger.warn(`${errorType}: ${message}`, { path: req.path });
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    type: errorType,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
