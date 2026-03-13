import { z } from 'zod';

/**
 * Zod Schema for a single business Pillar.
 */
export const pillarSchema = z.object({
  name: z.string(),
  description: z.string(),
  associatedFiles: z.array(z.string()),
});

/**
 * Zod Schema for the complete Structural Manifest (Structural Scout Output).
 */
export const structuralManifestSchema = z.object({
  projectName: z.string(),
  highLevelSummary: z.string(),
  quickStart: z.string(),
  pillars: z.array(pillarSchema),
});

export const geminiSchema = {
  type: 'OBJECT',
  properties: {
    projectName: { type: 'STRING' },
    highLevelSummary: { type: 'STRING' },
    quickStart: { type: 'STRING' },
    pillars: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          description: { type: 'STRING' },
          associatedFiles: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['name', 'description', 'associatedFiles'],
      },
    },
  },
  required: ['projectName', 'highLevelSummary', 'quickStart', 'pillars'],
};

/**
 * TypeScript Types inferred from the schemas.
 */
export type Pillar = z.infer<typeof pillarSchema>;
export type StructuralManifest = z.infer<typeof structuralManifestSchema>;
