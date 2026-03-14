import { Router } from 'express';
import {
  ingestProject,
  getProject,
  getProjectNodes,
  getProjectSecurity,
} from '../controllers/project.controller.js';
import validate from '../middleware/validation.middleware.js';
import { ingestProjectRequestSchema } from '../validations/project.validation.js';
import { ingestionRateLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// Publicly viewable documentation (No auth required for reading)
router.get('/:id', getProject);
router.get('/:id/nodes', getProjectNodes);
router.get('/:id/security', getProjectSecurity);

// Ingestion endpoint (Requires auth)
router.post(
  '/',
  authenticateUser,
  ingestionRateLimiter,
  validate(ingestProjectRequestSchema),
  ingestProject
);

export default router;
