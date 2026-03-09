import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

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

vi.mock('../services/project.service.js', () => ({
  ProjectService: { getOrCreateProject: vi.fn() },
}));

vi.mock('../services/jobs.service.js', () => ({
  JobService: {
    createJob: vi.fn(),
    updateJobStatus: vi.fn(), // Critical for background task safety
  },
}));

vi.mock('../services/git.service.js', () => ({
  GitService: { cloneRepository: vi.fn().mockResolvedValue('/temp/mock') },
}));

// 2. IMPORT APP & LIMITER
import app from '../app.js';
import { ProjectService } from '../services/project.service.js';
import { JobService } from '../services/jobs.service.js';
import { ingestionRateLimiter } from '../middleware/rateLimit.middleware.js';
import { Project } from '@codeatlas/shared-schema';
import { IngestionJob } from '@codeatlas/shared-schema';

describe('API Rate Limiting Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    //Reset the rate limiter store before each test.
    // This prevents tests in other files from "exhausting" the limit
    if (ingestionRateLimiter.resetKey) {
      // We use a mock IP to ensure isolation
      ingestionRateLimiter.resetKey('::ffff:127.0.0.1');
    }

    vi.mocked(ProjectService.getOrCreateProject).mockResolvedValue({
      id: 'proj_123',
      owner: 'test',
      repo: 'repo',
    } as unknown as Project);
    vi.mocked(JobService.createJob).mockResolvedValue({
      id: 'job_456',
      status: 'PENDING',
      progress: 0,
    } as unknown as IngestionJob);
  });

  it('should allow up to 5 requests successfully', async () => {
    const validUrl = 'https://github.com/facebook/react';

    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/projects')
        .send({ githubUrl: validUrl });

      expect(res.status, `Request #${i + 1} failed`).toBe(201);
    }
  });

  it('should return 429 on the 6th request', async () => {
    const validUrl = 'https://github.com/facebook/react';

    // 1. Exhaust the limit
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/projects').send({ githubUrl: validUrl });
    }

    // 2. The 6th attempt must fail
    const response = await request(app)
      .post('/api/projects')
      .send({ githubUrl: validUrl });

    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toContain(
      'Too many project ingestion requests'
    );
  });
});
