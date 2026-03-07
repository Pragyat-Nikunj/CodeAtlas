import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';

export const ingestProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { githubUrl } = req.body;

    if (!githubUrl) {
      return res.status(400).json({ error: 'GitHub URL is required' });
    }

    // Basic validation logic
    if (!githubUrl.includes('github.com')) {
      return res
        .status(400)
        .json({ error: 'Only GitHub repositories are supported' });
    }

    res.status(201).json({
      success: true,
      message: 'Project ingestion started',
      data: { githubUrl },
    });
  }
);
