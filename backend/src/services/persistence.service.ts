import { supabase } from '../config/supabase.js';
import { GeminiService } from './gemini.service.js';
import {
  StructuralManifest,
  SecurityReport,
  Pillar,
} from '@codeatlas/shared-schema';
import logger from '../config/logger.js';

/**
 * Service to handle saving AI-generated analysis and security data to Supabase.
 * Implements Vector Embedding generation for "Liquid Chat" semantic search.
 */
export class PersistenceService {
  /**
   * Saves the Architectural Manifest and generates embeddings for search.
   */
  static async saveManifest(
    projectId: string,
    manifest: StructuralManifest
  ): Promise<void> {
    try {
      logger.info(
        `Persisting architectural map and embeddings for project: ${projectId}`
      );

      // 1. Generate Root Summary Embedding
      const summaryText = `Project: ${manifest.projectName}. Summary: ${manifest.highLevelSummary}`;
      const summaryEmbedding =
        await GeminiService.generateEmbedding(summaryText);

      // 2. Create the Root Documentation Node
      const { data: rootNode, error: rootError } = await supabase
        .from('documentation_nodes')
        .insert([
          {
            project_id: projectId,
            title: 'Project Overview',
            content: `${manifest.highLevelSummary}\n\n## Quick Start\n${manifest.quickStart}`,
            type: 'SUMMARY',
            embedding: summaryEmbedding,
          },
        ])
        .select()
        .single();

      if (rootError)
        throw new Error(`Failed to insert root node: ${rootError.message}`);

      const pillarNodes = await Promise.all(
        manifest.pillars.map(async (pillar: Pillar) => {
          const pillarText = `Pillar: ${pillar.name}. Description: ${pillar.description}`;
          const embedding = await GeminiService.generateEmbedding(pillarText);

          return {
            project_id: projectId,
            parent_id: rootNode.id,
            title: pillar.name,
            content: pillar.description,
            type: 'PILLAR' as const,
            embedding: embedding,
          };
        })
      );

      const { error: pillarError } = await supabase
        .from('documentation_nodes')
        .insert(pillarNodes);

      if (pillarError)
        throw new Error(
          `Failed to insert pillar nodes: ${pillarError.message}`
        );

      await supabase
        .from('projects')
        .update({
          description: manifest.highLevelSummary,
          embedding: summaryEmbedding,
        })
        .eq('id', projectId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`PersistenceService.saveManifest failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Saves the Security Report findings and generates embeddings for vulnerability search.
   */
  static async saveSecurityReport(
    projectId: string,
    report: SecurityReport
  ): Promise<void> {
    try {
      logger.info(
        `Generating embeddings and saving ${report.findings.length} security findings.`
      );

      // Generate embeddings for findings in parallel
      const findingsWithEmbeddings = await Promise.all(
        report.findings.map(async f => {
          const findingText = `Vulnerability: ${f.vulnerability} in ${f.file_path}. Severity: ${f.severity}. Description: ${f.description}`;
          const embedding = await GeminiService.generateEmbedding(findingText);

          return {
            project_id: projectId,
            file_path: f.file_path,
            line_number: f.line_number,
            severity: f.severity,
            vulnerability: f.vulnerability,
            description: f.description,
            suggested_fix: f.suggested_fix,
            embedding: embedding,
            status: 'OPEN',
          };
        })
      );

      const { error } = await supabase
        .from('security_findings')
        .insert(findingsWithEmbeddings);

      if (error)
        throw new Error(`Failed to insert security findings: ${error.message}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`PersistenceService.saveSecurityReport failed: ${msg}`);
      throw error;
    }
  }
}
