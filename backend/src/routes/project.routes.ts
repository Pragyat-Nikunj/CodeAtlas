import { Router } from 'express';
import { ingestProject } from '../controllers/project.controller.js';
import validate from '../middleware/validation.middleware.js';
import { ingestProjectRequestSchema } from '../validations/project.validation.js';
import { ingestionRateLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.post(
  '/',
  authenticateUser,
  ingestionRateLimiter,
  validate(ingestProjectRequestSchema),
  ingestProject
);

export default router;
