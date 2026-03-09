import { rateLimit } from 'express-rate-limit';
import logger from '../config/logger.js';

/**
 * Standard Rate Limiter for Project Ingestion.
 * Limits users to 5 repository ingestion requests per 15 minutes.
 * This prevents abuse of the Gemini 3 processing engine.
 */
export const ingestionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: {
    success: false,
    error:
      'Too many project ingestion requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  },
});

/**
 * Global API Rate Limiter.
 * A more relaxed limit for general browsing and health checks.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
});
