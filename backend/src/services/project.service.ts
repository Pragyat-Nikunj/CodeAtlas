import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { Project } from '@codeatlas/shared-schema';

/**
 * Service to handle all database operations related to Project metadata.
 */
export class ProjectService {
  /**
   * Gets an existing project or creates a new one if it doesn't exist.
   * @param owner The owner of the GitHub repository.
   * @param repo The name of the GitHub repository.
   * @param url The full GitHub URL of the repository.
   * @returns The project record.
   */
  static async getOrCreateProject(
    owner: string,
    repo: string,
    url: string
  ): Promise<Project> {
    try {
      const { data: existing, error: findError } = await supabase
        .from('projects')
        .select('*')
        .eq('github_url', url)
        .maybeSingle();

      if (findError) throw findError;
      if (existing) {
        logger.info(`Found existing project: ${owner}/${repo}`);
        return existing;
      }

      const { data: created, error: insertError } = await supabase
        .from('projects')
        .insert([{ owner, repo, github_url: url }])
        .select()
        .single();

      if (insertError) throw insertError;

      logger.info(`Initialized new project record: ${owner}/${repo}`);
      return created;
    } catch (error) {
      logger.error(`ProjectService.getOrCreateProject failed: ${error}`);
      throw error;
    }
  }
}
