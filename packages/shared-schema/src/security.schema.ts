import { z } from 'zod';

/**
 * The "Base" Finding.
 * This is the source of truth for what a security issue looks like,
 * whether it's coming from the AI or being displayed in the UI.
 */
export const securityFindingSchema = z.object({
  file_path: z.string(),
  line_number: z.number().nullable(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  vulnerability: z.string(),
  description: z.string(),
  suggested_fix: z.string().nullable(),
  embedding: z.array(z.number()).optional(),
});

/**
 * The AI Report Schema.
 * Used by Gemini to return the structured audit.
 */
export const securityReportSchema = z.object({
  summary: z.string(),
  findings: z.array(securityFindingSchema),
});

export type SecurityFindingAI = z.infer<typeof securityFindingSchema>;
export type SecurityReport = z.infer<typeof securityReportSchema>;

/**
 * Gemini JSON Schema (Generation Config)
 * Strictly matches the Zod schema above.
 */
export const securityReportGeminiSchema = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    findings: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          file_path: { type: 'STRING' },
          line_number: { type: 'NUMBER' },
          severity: {
            type: 'STRING',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          },
          vulnerability: { type: 'STRING' },
          description: { type: 'STRING' },
          suggested_fix: { type: 'STRING' },
        },
        required: [
          'file_path',
          'line_number',
          'severity',
          'vulnerability',
          'description',
          'suggested_fix',
        ],
      },
    },
  },
  required: ['summary', 'findings'],
};
