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

    const prompt = `Act as a Principal Software Architect and Technical Writer. You are performing a deep architectural analysis of the repository "${repoName}".

Your goal is to produce a comprehensive, human-readable architectural map that would impress both technical recruiters and senior engineers.

### CORE TASKS:

1. **Project Summary:** Write 3-4 sentences describing the project's purpose, business value, target problem, and what makes it technically interesting.

2. **Quick Start Guide:** Based on README, package.json, and entry files, generate a practical quick start. Include prerequisites, environment setup, and the exact commands to run the project.

3. **Define 4-6 Domain Pillars:** Identify the core functional domains of the system. Name them evocatively (e.g. "Identity & Trust Perimeter", "Real-time Data Orchestration"). For EACH pillar write:
   - A detailed 4-6 sentence description explaining:
     * What this domain is responsible for
     * How it works internally (key patterns, technologies used)
     * Why it is critical to the overall system
     * What would break if this pillar didn't exist
     * How it connects or depends on other pillars
   - List the specific files that belong to this pillar

4. **File Mapping:** Map every meaningful file to its most relevant pillar. Ignore config boilerplate unless architecturally significant.

### QUALITY BAR:
- Each pillar description must be at least 4 sentences. One-sentence descriptions are NOT acceptable.
- Use confident, architectural language — write as if presenting to a CTO.
- Mention specific technologies, patterns, and design decisions you observe in the code.
- Make it clear WHY each architectural decision matters, not just what it does.

### INPUT DATA:
Repository File List and Context:
${fileData}`;

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
