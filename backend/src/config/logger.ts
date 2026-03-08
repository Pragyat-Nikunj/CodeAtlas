import winston from 'winston';

/**
 * Logger configuration using Winston. Logs are written to files and the console (in non-production environments).
 * - Error logs go to 'logs/error.log'.
 * - All logs go to 'logs/combined.log'.
 * - In development, logs are also printed to the console with colorization.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    (winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json())
  ),
  defaultMeta: { service: 'CodeAtlas' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        (winston.format.colorize(), winston.format.simple())
      ),
    })
  );
}

export default logger;
