import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Project Ingestion API', () => {
  describe('POST /api/projects', () => {
    it('should return 400 if githubUrl is missing', async () => {
      const response = await request(app).post('/api/projects').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'GitHub URL is required');
    });

    it('should return 400 if the URL is not from GitHub', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ githubUrl: 'https://gitlab.com/user/repo' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Only GitHub repositories are supported'
      );
    });

    it('should return 201 if a valid githubUrl is provided', async () => {
      const validUrl = 'https://github.com/user/repo';
      const response = await request(app)
        .post('/api/projects')
        .send({ githubUrl: validUrl });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toBe('Project ingestion started');
      expect(response.body.data.githubUrl).toBe(validUrl);
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
