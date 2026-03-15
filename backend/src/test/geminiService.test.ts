import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../services/gemini.service.js';
/* eslint-disable @typescript-eslint/no-explicit-any */
describe('GeminiService', () => {
  const mockApiKey = 'test-key';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_GENAI_API_KEY = mockApiKey;
    global.fetch = vi.fn();
  });

  describe('generateEmbedding', () => {
    it('should return embedding values on success', async () => {
      const mockValues = new Array(3072).fill(0.1);
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ embedding: { values: mockValues } }),
      });

      const result = await GeminiService.generateEmbedding('test text');
      expect(result).toEqual(mockValues);
    });

    it('should retry on non-404 errors and eventually succeed', async () => {
      const mockValues = [0.1, 0.2];
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ embedding: { values: mockValues } }),
        });

      const result = await GeminiService.generateEmbedding('test');
      expect(result).toEqual(mockValues);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
