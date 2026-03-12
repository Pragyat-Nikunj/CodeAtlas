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
      You are a senior Software Architect analyzing a code repository to understand its architecture.

Your goal is to reconstruct the system architecture from the repository structure and file descriptions.

Avoid vague or corporate-sounding categories like "Core", "Platform", or "Data Orchestration" unless they clearly exist in the code.

Focus on identifying REAL architectural components and responsibilities.

--------------------------------------------------

TASKS

1. Identify the major architectural components of the system (3–7 components).
   Components should represent meaningful runtime or logical parts of the system such as:
   - API Layer
   - Controllers / Routes
   - Business Logic / Services
   - AI or Processing Engines
   - Data Access / Repositories
   - Authentication / Identity
   - Background Jobs / Workers
   - Integrations with external services
   - Shared utilities or infrastructure

2. For each component provide:

Component Name

Responsibility  
Explain what this component does in simple terms (2–3 sentences).

Key Files / Folders  
List the files or folders that belong to this component.

Interactions  
Describe what other components it communicates with.

3. Identify the system layers if possible:
   - Interface Layer (API / UI)
   - Application Logic
   - Data Layer
   - External Integrations

4. Describe the high-level request flow if the system exposes an API.
Example:
User Request → Route → Controller → Service → Database / External API → Response

5. Provide a final high-level system summary explaining:
   - What the system does
   - The main capabilities
   - The value it provides

--------------------------------------------------

INPUT

Repository Name: ${repoName}

Repository Files and Descriptions:
${fileData}

--------------------------------------------------

OUTPUT FORMAT

# System Overview
Short explanation of what this project does.

# Architecture Components

## 1. <Component Name>
Responsibility:
Key Files:
Interactions:

## 2. <Component Name>
Responsibility:
Key Files:
Interactions:

...

# System Layers
Interface Layer:
Application Layer:
Data Layer:
External Integrations:

# Request / Data Flow
Step-by-step explanation of how the system processes a request.

# Architectural Summary
How the components work together.
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
