import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { IngestProjectInput } from '@codeatlas/shared-schema';
import { ProjectService } from '../services/project.service.js';
import { JobService } from '../services/jobs.service.js';
import logger from '../config/logger.js';

/**
 * Orchestrates the ingestion process.
 * * Flow:
 * 1. ProjectService: Upserts the project record in Supabase.
 * 2. JobService: Creates a new tracking job with status 'PENDING'.
 * 3. Future Step: Trigger GitService background cloning.
 * 4. Response: Immediate 201 Created with metadata for the UI.
 */
export const ingestProject = asyncHandler(
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  async (req: Request<{}, {}, IngestProjectInput>, res: Response) => {
    const { githubUrl } = req.body;
    const { url, owner, repo } = githubUrl;

    logger.info(`Processing ingestion request for: ${owner}/${repo}`);

    // Step 1: Database Persistence (Project)
    const project = await ProjectService.getOrCreateProject(owner, repo, url);

    // Step 2: Initialize Ingestion Job
    const job = await JobService.createJob(project.id);

    // Step 3: Success Response
    // We return the jobId so the frontend can start polling for progress.
    res.status(201).json({
      success: true,
      message: 'Project ingestion initialized successfully',
      data: {
        projectId: project.id,
        jobId: job.id,
        status: job.status,
        repository: `${owner}/${repo}`,
        progress: job.progress,
      },
    });
  }
);
