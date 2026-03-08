import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import logger from '../config/logger.js';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

/**
 * Creates a validation middleware for a given Zod schema.
 * @param schema The Zod schema to validate against. Should be a ZodObject that defines the expected structure of req.body, req.query, and req.params.
 * @returns The validation middleware function.
 */
const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body;
      req.query = parsed.query as ParsedQs;
      req.params = parsed.params as ParamsDictionary;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn(
          `Validation failed for ${req.url}: ${error.issues[0].message}`
        );
        return res.status(400).json({
          success: false,
          error: error.issues[0].message,
        });
      }
      return next(error);
    }
  };
};

export default validate;
