export type JobStatus =
  | 'PENDING'
  | 'CLONING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'FAILED';

export interface IngestionJob {
  id: string;
  project_id: string;
  status: JobStatus;
  error_message?: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
}
