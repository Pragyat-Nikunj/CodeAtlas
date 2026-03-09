import { simpleGit, SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';
import logger from '../config/logger.js';
import { JobService } from './jobs.service.js';

/**
 * Service to handle repository cloning and local file management.
 */
export class GitService {
  private static TEMP_DIR = path.join(process.cwd(), 'temp');

  /**
   * Clones a repository to a temporary directory.
   * Updates the job status to 'CLONING' and handles progress.
   */
  static async cloneRepository(jobId: string, url: string): Promise<string> {
    const git: SimpleGit = simpleGit();
    const clonePath = path.join(this.TEMP_DIR, jobId);

    try {
      await JobService.updateJobStatus(jobId, 'CLONING', 10);
      logger.info(`Starting clone: ${url} into ${clonePath}`);

      if (!fs.existsSync(this.TEMP_DIR)) {
        fs.mkdirSync(this.TEMP_DIR, { recursive: true });
      }

      // use --depth 1 (only lates commit)
      await git.clone(url, clonePath, ['--depth', '1']);

      await JobService.updateJobStatus(jobId, 'CLONING', 30);
      logger.info(`Clone completed for job: ${jobId}`);

      return clonePath;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Git clone failed';
      logger.error(`GitService.cloneRepository Error: ${message}`);

      await JobService.updateJobStatus(jobId, 'FAILED', 0, message);
      throw error;
    }
  }

  /**
   * Cleans up the cloned repository after processing is done.
   */
  static async cleanup(jobId: string): Promise<void> {
    const targetPath = path.join(this.TEMP_DIR, jobId);
    try {
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        logger.info(`Cleaned up directory: ${targetPath}`);
      }
    } catch (error) {
      logger.error(`Failed to cleanup path ${targetPath}: ${error}`);
    }
  }
}
