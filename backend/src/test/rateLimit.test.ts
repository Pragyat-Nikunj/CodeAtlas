import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.hoisted(() => {
  process.env.SUPABASE_URL = 'https://mock.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'mock-key';
  process.env.GOOGLE_GENAI_API_KEY = 'mock-ai-key';
  process.env.NODE_ENV = 'test';
});

vi.mock('../config/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: {}, error: null }),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  authenticateUser: vi.fn((req, _res, next) => {
    (req as any).user = { id: 'test-user-uuid' };
    next();
  }),
}));

vi.mock('../services/project.service.js');
vi.mock('../services/jobs.service.js');
// Ensure GitService returns a promise to avoid crashing the controller
vi.mock('../services/git.service.js', () => ({
  GitService: {
    cloneRepository: vi.fn().mockResolvedValue('/temp/mock'),
    cleanup: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('../services/file.service.js');
vi.mock('../services/analysis.service.js');
vi.mock('../services/security.service.js');
vi.mock('../services/persistence.service.js');

import app from '../app.js';
import { ProjectService } from '../services/project.service.js';
import { JobService } from '../services/jobs.service.js';
import { ingestionRateLimiter } from '../middleware/rateLimit.middleware.js';

describe('API Rate Limiting Protection (Authenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset rate limiter state for the local test IP
    if (ingestionRateLimiter.resetKey) {
      ingestionRateLimiter.resetKey('::ffff:127.0.0.1');
    }

    vi.mocked(ProjectService.getOrCreateProject).mockResolvedValue({
      id: 'proj_123',
    } as any);
    vi.mocked(JobService.createJob).mockResolvedValue({
      id: 'job_456',
      status: 'PENDING',
      progress: 0,
    } as any);
  });

  it('should allow up to 5 requests successfully', async () => {
    const validUrl = 'https://github.com/facebook/react';

    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/projects')
        .send({ githubUrl: validUrl });

      expect(res.status).toBe(201);
    }
  });

  it('should return 429 on the 6th request', async () => {
    const validUrl = 'https://github.com/facebook/react';

    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/projects').send({ githubUrl: validUrl });
    }

    const response = await request(app)
      .post('/api/projects')
      .send({ githubUrl: validUrl });

    expect(response.status).toBe(429);
    expect(response.body.error).toContain(
      'Too many project ingestion requests'
    );
  });
});
