import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { ProjectService } from '../services/project.service.js';
import { JobService } from '../services/jobs.service.js';
/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock the services
vi.mock('../services/project.service.js', () => ({
  ProjectService: {
    getOrCreateProject: vi.fn(),
  },
}));

vi.mock('../services/jobs.service.js', () => ({
  JobService: {
    createJob: vi.fn(),
  },
}));

describe('Project Ingestion API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/projects', () => {
    it('should return 400 if githubUrl is missing', async () => {
      const response = await request(app).post('/api/projects').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'GitHub URL is required');
    });

    it('should return 400 if the URL is not a valid GitHub repo', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ githubUrl: 'https://gitlab.com/user/repo' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Enter a valid GitHub repository URL');
    });

    it('should return 201 if a valid githubUrl is provided and services succeed', async () => {
      const validUrl = 'https://github.com/facebook/react';

      const mockProject = {
        id: 'proj_123',
        owner: 'facebook',
        repo: 'react',
        github_url: validUrl,
      };
      const mockJob = { id: 'job_456', status: 'PENDING', progress: 0 };

      // Using direct mock access for static methods
      (ProjectService.getOrCreateProject as any).mockResolvedValue(mockProject);
      (JobService.createJob as any).mockResolvedValue(mockJob);

      const response = await request(app)
        .post('/api/projects')
        .send({ githubUrl: validUrl });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'Project ingestion initialized successfully'
      );

      expect(response.body.data).toMatchObject({
        projectId: 'proj_123',
        jobId: 'job_456',
        status: 'PENDING',
        repository: 'facebook/react',
        progress: 0,
      });

      expect(ProjectService.getOrCreateProject).toHaveBeenCalledWith(
        'facebook',
        'react',
        validUrl
      );
      expect(JobService.createJob).toHaveBeenCalledWith('proj_123');
    });
  });

  describe('Utility Routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/not-found');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });
});
