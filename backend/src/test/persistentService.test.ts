import { describe, it, expect, vi, beforeEach } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.hoisted(() => {
  process.env.SUPABASE_URL = 'https://mock.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'mock-key';
});

// Mock dependencies
vi.mock('../services/gemini.service.js', () => ({
  GeminiService: {
    generateEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
  },
}));
const mockSingle = vi
  .fn()
  .mockResolvedValue({ data: { id: 'node_1' }, error: null });
const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
const mockEq = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

vi.mock('../config/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
      update: mockUpdate,
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: 'node_1' }, error: null }),
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

import { PersistenceService } from '../services/persistence.service.js';

describe('PersistenceService: Data Commitment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save structural manifest with vector embeddings', async () => {
    const mockManifest = {
      projectName: 'TestRepo',
      highLevelSummary: 'A test project',
      quickStart: 'npm start',
      pillars: [
        { name: 'Core', description: 'Main logic', associatedFiles: [] },
      ],
    };

    await PersistenceService.saveManifest('proj_123', mockManifest as any);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        embedding: expect.any(Array),
      })
    );
  });
});
