import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { IngestProjectInput } from '@codeatlas/shared-schema';
import { ProjectService } from '../services/project.service.js';
import { JobService } from '../services/jobs.service.js';
import { GitService } from '../services/git.service.js';
import { FileService } from '../services/repoContext.service.js';
import { AnalysisService } from '../services/analysis.service.js';
import { SecurityService } from '../services/security.service.js';
import { PersistenceService } from '../services/persistence.service.js';
import { supabase } from '../config/supabase.js';

/**
 * Orchestrates the ingestion process.
 */
export const ingestProject = asyncHandler(
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  async (req: Request<{}, {}, IngestProjectInput>, res: Response) => {
    const { githubUrl } = req.body;
    const { url, owner, repo } = githubUrl;

    const project = await ProjectService.getOrCreateProject(owner, repo, url);
    const job = await JobService.createJob(project.id);

    (async () => {
      try {
        const localPath = await GitService.cloneRepository(job.id, url);

        await JobService.updateJobStatus(job.id, 'ANALYZING', 40);
        const projectContext = await FileService.getProjectContext(localPath);

        const manifest = await AnalysisService.runStructuralScout(
          repo,
          projectContext
        );
        await PersistenceService.saveManifest(project.id, manifest);

        await JobService.updateJobStatus(job.id, 'ANALYZING', 70);
        const securityReport = await SecurityService.runSecurityAudit(
          repo,
          projectContext
        );
        await PersistenceService.saveSecurityReport(project.id, securityReport);

        await JobService.updateJobStatus(job.id, 'COMPLETED', 100);
        await GitService.cleanup(job.id);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        await JobService.updateJobStatus(job.id, 'FAILED', 0, msg);
        await GitService.cleanup(job.id);
      }
    })();

    res.status(201).json({
      success: true,
      data: {
        projectId: project.id,
        jobId: job.id,
        repository: `${owner}/${repo}`,
      },
    });
  }
);

/**
 * GET /api/projects/:id
 * Fetches the high-level metadata for a project.
 */
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data)
    return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true, data });
});

/**
 * GET /api/projects/:id/nodes
 * Fetches the documentation tree (Pillars and Summaries).
 */
export const getProjectNodes = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('documentation_nodes')
      .select('*')
      .eq('project_id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
  }
);

/**
 * GET /api/projects/:id/security
 * Fetches the security findings for a project.
 */
export const getProjectSecurity = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('security_findings')
      .select('*')
      .eq('project_id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
  }
);
