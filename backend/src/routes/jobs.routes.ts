import { Router } from 'express';
import { getJobStatus } from '../controllers/jobs.controller.js';

const router = Router();

/**
 * GET /api/jobs/:id
 * Tracking endpoint for background AI processes.
 */
router.get('/:id', getJobStatus);

export default router;
