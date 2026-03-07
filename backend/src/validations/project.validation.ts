import { z } from 'zod';
import { ingestProjectSchema } from '@codeatlas/shared-schema';

export const ingestProjectRequestSchema = z.object({
  body: ingestProjectSchema,
});

export type { IngestProjectInput } from '@codeatlas/shared-schema';
