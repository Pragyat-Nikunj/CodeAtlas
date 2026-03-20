import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { JobService } from '../services/jobs.service.js';

/**
 * GET /api/jobs/:id
 * Used by the frontend to poll for progress updates.
 */
export const getJobStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const job = await JobService.getJobById(id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({
      success: true,
      data: {
        status: job.status,
        progress: job.progress,
        projectId: job.project_id,
        error: job.error_message,
      },
    });
  }
);
