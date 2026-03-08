export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FindingStatus = 'OPEN' | 'FALSE_POSITIVE' | 'RESOLVED';

export interface SecurityFinding {
  id: string;
  project_id: string;
  file_path: string;
  line_number?: number | null;
  severity: FindingSeverity;
  description: string;
  suggested_fix?: string | null;
  status: FindingStatus;
  created_at: string;
}
