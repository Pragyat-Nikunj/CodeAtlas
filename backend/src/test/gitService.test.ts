import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitService } from '../services/git.service.js';
import { JobService } from '../services/jobs.service.js';
import { simpleGit } from 'simple-git';
import fs from 'fs';
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 1. HOISTED ENVIRONMENT SETUP
 * Prevents the Supabase config from throwing errors during import.
 */
vi.hoisted(() => {
  process.env.SUPABASE_URL = 'https://mock.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'mock-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-admin-key';
  process.env.NODE_ENV = 'test';
});

// 2. MOCK EXTERNAL MODULES
vi.mock('simple-git', () => ({
  simpleGit: vi.fn(() => ({
    clone: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../services/jobs.service.js', () => ({
  JobService: {
    updateJobStatus: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    rmSync: vi.fn(),
  },
}));
vi.mock('../config/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('GitService', () => {
  const mockJobId = 'job_123';
  const mockUrl = 'https://github.com/test/repo';
  const mockClone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (simpleGit as any).mockReturnValue({
      clone: mockClone.mockResolvedValue({}),
    });
    (fs.existsSync as any).mockReturnValue(true);
  });

  it('should clone repository and update status', async () => {
    const path = await GitService.cloneRepository(mockJobId, mockUrl);

    expect(mockClone).toHaveBeenCalledWith(
      mockUrl,
      expect.stringContaining(mockJobId),
      ['--depth', '1']
    );
    expect(JobService.updateJobStatus).toHaveBeenCalledWith(
      mockJobId,
      'CLONING',
      10
    );
    expect(JobService.updateJobStatus).toHaveBeenCalledWith(
      mockJobId,
      'CLONING',
      30
    );
    expect(path).toContain(mockJobId);
  });

  it('should handle clone errors and set job to FAILED', async () => {
    mockClone.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      GitService.cloneRepository(mockJobId, mockUrl)
    ).rejects.toThrow('Network error');
    expect(JobService.updateJobStatus).toHaveBeenCalledWith(
      mockJobId,
      'FAILED',
      0,
      'Network error'
    );
  });

  it('should cleanup directory if it exists', async () => {
    (fs.existsSync as any).mockReturnValue(true);
    await GitService.cleanup(mockJobId);
    expect(fs.rmSync).toHaveBeenCalled();
  });
});
