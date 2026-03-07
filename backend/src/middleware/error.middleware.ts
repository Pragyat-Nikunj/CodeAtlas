import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = err as AppError;

  const statusCode = error.statusCode ?? 500;
  const message = error.message ?? 'Internal Server Error';

  logger.error(`[${req.method}] ${req.url} >> ${message}`);

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack,
  });
};
