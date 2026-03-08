import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global error handling middleware for Express. Catches all errors thrown in the application and formats a consistent JSON response.
 * Logs the error details using the configured logger.
 * In production, stack traces are omitted from the response for security reasons.
 * @param err - The error object thrown in the application.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param _next - The next middleware function (not used here).
 * @returns A JSON response with success=false, error message, and optionally the stack trace.
 */
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
