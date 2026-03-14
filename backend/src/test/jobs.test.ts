import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobService } from '../services/jobs.service.js';
import { supabase } from '../config/supabase.js';

/**
 * Enhanced Supabase Mock
 * We need to mock .from().select().eq().maybeSingle() for getJobById
 * and .from().insert().select().single() for createJob
 */
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('../config/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect.mockReturnThis(),
      insert: mockInsert.mockReturnThis(),
      update: mockUpdate.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
    })),
  },
}));

describe('JobService: State Machine & Data Retrieval', () => {
  const mockJobId = 'test-job-uuid';
  const mockProjectId = 'test-project-uuid';

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock setup for chaining
    mockSelect.mockReturnThis();
    mockInsert.mockReturnThis();
    mockUpdate.mockReturnThis();
    mockEq.mockReturnThis();
  });

  describe('createJob', () => {
    it('should insert a new job and return the created record', async () => {
      const mockJob = {
        id: mockJobId,
        project_id: mockProjectId,
        status: 'PENDING',
        progress: 0,
      };
      mockSingle.mockResolvedValueOnce({ data: mockJob, error: null });

      const result = await JobService.createJob(mockProjectId);

      expect(supabase.from).toHaveBeenCalledWith('ingestion_jobs');
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          project_id: mockProjectId,
          status: 'PENDING',
        }),
      ]);
      expect(result).toEqual(mockJob);
    });

    it('should throw an error if insertion fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: new Error('Insert failed'),
      });
      await expect(JobService.createJob(mockProjectId)).rejects.toThrow(
        'Insert failed'
      );
    });
  });

  describe('updateJobStatus', () => {
    it('should transition status and progress correctly', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await JobService.updateJobStatus(mockJobId, 'CLONING', 10);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'CLONING',
          progress: 10,
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', mockJobId);
    });

    it('should handle failures with error messages', async () => {
      mockEq.mockResolvedValueOnce({ error: null });
      const errorMsg = 'Git timeout';

      await JobService.updateJobStatus(mockJobId, 'FAILED', 0, errorMsg);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          error_message: errorMsg,
          status: 'FAILED',
        })
      );
    });
  });

  describe('getJobById', () => {
    it('should return a job if it exists', async () => {
      const mockJob = { id: mockJobId, status: 'ANALYZING', progress: 45 };
      mockMaybeSingle.mockResolvedValueOnce({ data: mockJob, error: null });

      const result = await JobService.getJobById(mockJobId);

      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', mockJobId);
      expect(result).toEqual(mockJob);
    });

    it('should return null if the job does not exist', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const result = await JobService.getJobById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw an error if the database query fails', async () => {
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: new Error('Query failed'),
      });
      await expect(JobService.getJobById(mockJobId)).rejects.toThrow(
        'Query failed'
      );
    });
  });
});
