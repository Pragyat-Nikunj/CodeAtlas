import {
  securityReportSchema,
  securityReportGeminiSchema,
  type SecurityReport,
} from '@codeatlas/shared-schema';
import { GeminiService } from './gemini.service.js';
import logger from '../config/logger.js';

/**
 * Service to perform automated security audits using Gemini.
 * Maps vulnerabilities to exact files and line numbers.
 */
export class SecurityService {
  /**
   * Scans project context for common vulnerabilities and provides fix proposals.
   */
  static async runSecurityAudit(
    repoName: string,
    fileData: string
  ): Promise<SecurityReport> {
    logger.info(`Running Security Audit for: ${repoName}`);

    const prompt = `
      Act as a Senior Security Researcher and DevSecOps Engineer. 
      Analyze the source code of the repository "${repoName}" for security vulnerabilities.

      ### CORE TASKS:
      1. **Vulnerability Detection:** Scan the provided code for OWASP Top 10 issues, memory leaks, hardcoded secrets, and logical flaws.
      2. **Contextual Mapping:** For every issue found, identify the exact file path and approximate line number.
      3. **Severity Assessment:** Categorize findings as LOW, MEDIUM, HIGH, or CRITICAL.
      4. **Remediation:** Provide a specific, actionable code-fix proposal for each finding.

      ### CONSTRAINTS:
      - Be strict. Do not report stylistic issues, only security risks.
      - If no critical or high vulnerabilities are found, report informative low-severity best practices.
      - Ensure the "file" field matches the paths provided in the input data exactly.

      ### INPUT DATA:
      Repository Context:
      ${fileData}
    `;

    try {
      return await GeminiService.generateStructuredJson<SecurityReport>(
        prompt,
        securityReportGeminiSchema,
        securityReportSchema
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Security Audit pass failed: ${msg}`);
      return {
        summary: 'Security audit failed to process.',
        findings: [],
      };
    }
  }
}
