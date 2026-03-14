import {
  structuralManifestSchema,
  type StructuralManifest,
  geminiSchema,
} from '@codeatlas/shared-schema';
import { GeminiService } from './gemini.service.js';
import logger from '../config/logger.js';

/**
 * Service responsible for high-level architectural analysis using Gemini.
 */
export class AnalysisService {
  /**
   * Analyzes a list of files and their purposes to group them into business pillars.
   */
  static async runStructuralScout(
    repoName: string,
    fileData: string
  ): Promise<StructuralManifest> {
    logger.info(`Running Structural Scout for: ${repoName}`);

    const prompt = `
      Act as a Principal Software Architect and Product Strategist. You are analyzing the repository "${repoName}".
      
      Your goal is to perform a "Structural Scout" operation to translate a raw technical codebase into a high-level, human-readable architectural map.

      ### CORE TASKS:
      1. **Identify the North Star:** Provide a concise, high-level summary of the project's primary business value and target problem space.
      2. **Define 3-5 Domain Pillars:** Instead of technical folders (like 'utils' or 'controllers'), identify the "Functional Domains" of the system. 
         - Examples: "Identity & Trust Perimeter", "Real-time Data Orchestration", "Predictive Analytics Engine".
      3. **Strategic Summarization:** For each Pillar, provide a brief summary that explains *what* it does and *why* it is critical to the project.
      4. **Automated Quick Start:** Based on the file structure (look for README, package.json, main files), generate a "Quick Start" guide. Include:
         - Core prerequisites.
         - The 3 most important commands to get the project running.
      5. **Intelligent Mapping:** Map the provided files to these pillars. A file can belong to the most relevant pillar.

      ### CONSTRAINTS:
      - Use professional, architectural language.
      - Avoid deep technical jargon in the descriptions; focus on functionality.
      - If a file doesn't fit a major pillar, ignore it or group it into a secondary 'Infrastructure' pillar if absolutely necessary.

      ### INPUT DATA:
      Repository File List and Context:
      ${fileData}
    `;

    try {
      return await GeminiService.generateStructuredJson<StructuralManifest>(
        prompt,
        geminiSchema,
        structuralManifestSchema
      );
    } catch (error) {
      logger.error(`Structural Scout failed: ${error}`);
      throw error;
    }
  }
}
