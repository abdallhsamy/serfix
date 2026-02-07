import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : 'Internal server error';
  const code = isAppError ? err.code : undefined;

  if (statusCode >= 500) {
    logger.error('Unhandled error', err, { statusCode });
  }

  res.status(statusCode).json({
    error: message,
    ...(code && { code }),
    ...(config.nodeEnv !== 'production' && !isAppError && err.stack && { stack: err.stack }),
  });
}
