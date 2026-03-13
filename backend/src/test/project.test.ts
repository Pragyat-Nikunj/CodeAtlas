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
    (req as any).user = { id: 'test-user-uuid', email: 'tester@codewiki.ai' };
    next();
  }),
}));

// Mock services with default resolved promises to prevent .then() crashes
vi.mock('../services/project.service.js');
vi.mock('../services/jobs.service.js');
vi.mock('../services/git.service.js', () => ({
  GitService: {
    cloneRepository: vi.fn().mockResolvedValue('/temp/mock-path'),
    cleanup: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('../services/file.service.js');
vi.mock('../services/analysis.service.js');
vi.mock('../services/security.service.js');
vi.mock('../services/persistence.service.js');

// 3. IMPORTS
import app from '../app.js';
import { ProjectService } from '../services/project.service.js';
import { JobService } from '../services/jobs.service.js';

describe('Project Ingestion API (Authenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/projects', () => {
    it('should return 400 if githubUrl is missing', async () => {
      const response = await request(app).post('/api/projects').send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/required/i);
    });

    it('should return 201 if a valid githubUrl is provided and services succeed', async () => {
      const validUrl = 'https://github.com/facebook/react';

      const mockProject = {
        id: 'proj_123',
        owner: 'facebook',
        repo: 'react',
        github_url: validUrl,
      };

      const mockJob = {
        id: 'job_456',
        status: 'PENDING',
        progress: 0,
      };

      // Set explicit mock returns for this specific test case
      vi.mocked(ProjectService.getOrCreateProject).mockResolvedValue(
        mockProject as any
      );
      vi.mocked(JobService.createJob).mockResolvedValue(mockJob as any);

      const response = await request(app)
        .post('/api/projects')
        .send({ githubUrl: validUrl });

      // If this is 500, check the logs for "TypeError: Cannot read properties of undefined (reading 'then')"
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectId: 'proj_123',
        jobId: 'job_456',
        repository: 'facebook/react',
      });
    });
  });

  describe('Utility Routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/this-does-not-exist');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });
});
