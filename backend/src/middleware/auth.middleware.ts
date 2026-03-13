import { Request, Response, NextFunction } from 'express';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

/**
 * Interface to extend Express Request with authenticated user information.
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * Middleware to verify Supabase JWT.
 * Validates the 'Authorization' header and attaches the user to the request.
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const authReq = req as AuthenticatedRequest;
    authReq.user = user;

    next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Auth Middleware Error: ${errorMessage}`);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
};
