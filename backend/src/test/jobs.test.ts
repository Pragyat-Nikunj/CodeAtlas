import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobService } from '../services/jobs.service.js';
import { supabase } from '../config/supabase.js';

// We create a mock for the supabase client's chained methods
// .from().update().eq()
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock('../config/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: null }),
      }),
    })),
  },
}));

describe('JobService: State Machine Transitions', () => {
  const mockJobId = 'test-job-uuid';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transition status from PENDING to CLONING with 10% progress', async () => {
    await JobService.updateJobStatus(mockJobId, 'CLONING', 10);

    expect(supabase.from).toHaveBeenCalledWith('ingestion_jobs');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CLONING',
        progress: 10,
      })
    );
    expect(mockEq).toHaveBeenCalledWith('id', mockJobId);
  });

  it('should transition status to ANALYZING with 50% progress', async () => {
    await JobService.updateJobStatus(mockJobId, 'ANALYZING', 50);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ANALYZING',
        progress: 50,
      })
    );
  });

  it('should transition to FAILED and store the error message', async () => {
    const errorReason = 'Repository too large';
    await JobService.updateJobStatus(mockJobId, 'FAILED', 0, errorReason);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILED',
        progress: 0,
        error_message: errorReason,
      })
    );
  });

  it('should include a valid updated_at timestamp on every transition', async () => {
    await JobService.updateJobStatus(mockJobId, 'COMPLETED', 100);

    const callArgs = mockUpdate.mock.calls[0][0];
    expect(callArgs).toHaveProperty('updated_at');
    expect(new Date(callArgs.updated_at).toString()).not.toBe('Invalid Date');
  });

  it('should handle database errors gracefully without throwing', async () => {
    mockEq.mockResolvedValueOnce({ error: new Error('DB Connection Failed') });
    await expect(
      JobService.updateJobStatus(mockJobId, 'CLONING', 10)
    ).resolves.not.toThrow();
  });
});
