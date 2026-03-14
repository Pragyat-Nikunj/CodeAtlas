import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 1. HOISTED ENVIRONMENT SETUP
 * Configures mock environment before any imports execute.
 */
vi.hoisted(() => {
  process.env.SUPABASE_URL = 'https://mock.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';
  process.env.GOOGLE_GENAI_API_KEY = 'mock-ai-key';
  process.env.NODE_ENV = 'test';
});

/**
 * 2. MOCK EXTERNAL MODULES
 */
const mockSupabaseResponse = {
  data: null as any,
  error: null as any,
};

vi.mock('../config/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() => Promise.resolve(mockSupabaseResponse)),
      single: vi.fn(() => Promise.resolve(mockSupabaseResponse)),
      then: vi.fn(resolve => resolve(mockSupabaseResponse)), // For standard queries
    })),
  },
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  authenticateUser: vi.fn((req, _res, next) => {
    // Inject mock user into request
    (req as any).user = { id: 'test-user-uuid', email: 'tester@codewiki.ai' };
    next();
  }),
}));

// Mock Pipeline Services
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

describe('Project API Suite', () => {
  const mockProjectId = 'proj_123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseResponse.data = null;
    mockSupabaseResponse.error = null;
  });

  /**
   * INGESTION PIPELINE TESTS (POST)
   */
  describe('POST /api/projects - Ingestion Pipeline', () => {
    it('should return 400 if githubUrl is missing', async () => {
      const response = await request(app).post('/api/projects').send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/required/i);
    });

    it('should initialize ingestion and return 201', async () => {
      const validUrl = 'https://github.com/facebook/react';

      const mockProject = {
        id: mockProjectId,
        owner: 'facebook',
        repo: 'react',
        github_url: validUrl,
      };
      const mockJob = { id: 'job_456', status: 'PENDING', progress: 0 };

      vi.mocked(ProjectService.getOrCreateProject).mockResolvedValue(
        mockProject as any
      );
      vi.mocked(JobService.createJob).mockResolvedValue(mockJob as any);

      const response = await request(app)
        .post('/api/projects')
        .send({ githubUrl: validUrl });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        projectId: mockProjectId,
        repository: 'facebook/react',
      });
    });
  });

  /**
   * READ API TESTS (GET)
   */
  describe('GET /api/projects/:id - Metadata', () => {
    it('should return project details when found', async () => {
      mockSupabaseResponse.data = {
        id: mockProjectId,
        repo: 'react',
        description: 'AI Wiki',
      };

      const response = await request(app).get(`/api/projects/${mockProjectId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(mockProjectId);
    });

    it('should return 404 when project is missing', async () => {
      mockSupabaseResponse.data = null;
      mockSupabaseResponse.error = { message: 'Not found' };

      const response = await request(app).get(`/api/projects/ghost-id`);
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/projects/:id/nodes - Documentation Tree', () => {
    it('should return pillars and summaries for the project', async () => {
      const mockNodes = [
        { id: 'node_1', title: 'Architecture', type: 'PILLAR' },
        { id: 'node_2', title: 'Overview', type: 'SUMMARY' },
      ];
      // Simulate Supabase returning a list
      // Note: standard .then() mock used here for non-single queries
      vi.mocked(mockSupabaseResponse).data = mockNodes;

      const response = await request(app).get(
        `/api/projects/${mockProjectId}/nodes`
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe('Architecture');
    });
  });

  describe('GET /api/projects/:id/security - Security Audit', () => {
    it('should return detected vulnerabilities', async () => {
      const mockFindings = [
        {
          file_path: 'auth.ts',
          severity: 'CRITICAL',
          vulnerability: 'Hardcoded Key',
        },
      ];
      mockSupabaseResponse.data = mockFindings;

      const response = await request(app).get(
        `/api/projects/${mockProjectId}/security`
      );

      expect(response.status).toBe(200);
      expect(response.body.data[0].severity).toBe('CRITICAL');
    });
  });

  describe('Utility Routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/projects/unknown/path');
      expect(response.status).toBe(404);
    });
  });
});
