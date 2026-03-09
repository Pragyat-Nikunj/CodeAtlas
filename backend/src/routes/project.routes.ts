import { Router } from 'express';
import { ingestProject } from '../controllers/project.controller.js';
import validate from '../middleware/validation.middleware.js';
import { ingestProjectRequestSchema } from '../validations/project.validation.js';
import { ingestionRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post(
  '/',
  ingestionRateLimiter,
  validate(ingestProjectRequestSchema),
  ingestProject
);

export default router;
