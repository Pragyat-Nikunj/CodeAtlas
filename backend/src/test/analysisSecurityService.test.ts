import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  process.env.GOOGLE_GENAI_API_KEY = 'mock-key';
});

vi.mock('../services/gemini.service.js', () => ({
  GeminiService: {
    generateStructuredJson: vi.fn(),
  },
}));

import { AnalysisService } from '../services/analysis.service.js';
import { SecurityService } from '../services/security.service.js';
import { GeminiService } from '../services/gemini.service.js';

describe('Analysis and Security Services', () => {
  const mockRepo = 'test-repo';
  const mockContext = 'const x = 1;';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AnalysisService should return structured manifest', async () => {
    const mockOutput = { projectName: 'Test', pillars: [] };
    vi.mocked(GeminiService.generateStructuredJson).mockResolvedValue(
      mockOutput
    );

    const result = await AnalysisService.runStructuralScout(
      mockRepo,
      mockContext
    );
    expect(result.projectName).toBe('Test');
    expect(GeminiService.generateStructuredJson).toHaveBeenCalled();
  });

  it('SecurityService should return vulnerability findings', async () => {
    const mockOutput = { summary: 'Safe', findings: [] };
    vi.mocked(GeminiService.generateStructuredJson).mockResolvedValue(
      mockOutput
    );

    const result = await SecurityService.runSecurityAudit(
      mockRepo,
      mockContext
    );
    expect(result.summary).toBe('Safe');
  });
});
