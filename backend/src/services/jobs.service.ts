import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { IngestionJob, JobStatus } from '@codeatlas/shared-schema';

/**
 * Service to handle the lifecycle and state machine of ingestion jobs.
 * This service tracks the progress of repository analysis and security audits.
 */
export class JobService {
  /**
   * Creates a new job record to track the ingestion progress.
   * Initial status is always 'PENDING' with 0% progress.
   * @param projectId - The ID of the project this job is associated with.
   * @returns The created job record.
   */
  static async createJob(projectId: string): Promise<IngestionJob> {
    try {
      const { data, error } = await supabase
        .from('ingestion_jobs')
        .insert([
          {
            project_id: projectId,
            status: 'PENDING' as JobStatus,
            progress: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      logger.info(
        `Ingestion job created for project ID: ${projectId} (Job ID: ${data.id})`
      );
      return data;
    } catch (error) {
      logger.error(
        `JobService.createJob failed: ${error instanceof Error ? error.message : error}`
      );
      throw error;
    }
  }

  /**
   * Updates the status and progress of a job as it moves through the pipeline.
   * @param jobId - The unique identifier of the job.
   * @param status - The new JobStatus (PENDING, CLONING, ANALYZING, etc.).
   * @param progress - Integer percentage (0-100).
   * @param errorMsg - Optional message if the status is 'FAILED'.
   */
  static async updateJobStatus(
    jobId: string,
    status: JobStatus,
    progress: number,
    errorMsg?: string
  ): Promise<void> {
    try {
      const updateData: Partial<IngestionJob> & { updated_at: string } = {
        status,
        progress,
        updated_at: new Date().toISOString(),
      };

      if (errorMsg) {
        updateData.error_message = errorMsg;
      }

      const { error } = await supabase
        .from('ingestion_jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) throw error;

      logger.debug(`Job ${jobId} updated: ${status} (${progress}%)`);
    } catch (error) {
      logger.error(
        `Failed to update job status for ${jobId}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Retrieves a job by its ID, including its current status and progress.
   */
  static async getJobById(jobId: string): Promise<IngestionJob | null> {
    try {
      const { data, error } = await supabase
        .from('ingestion_jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(
        `JobService.getJobById failed: ${error instanceof Error ? error.message : error}`
      );
      throw error;
    }
  }
}
