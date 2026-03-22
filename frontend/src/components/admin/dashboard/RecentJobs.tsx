'use client';

import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export interface AdminJob {
  id: string;
  project_repo: string;
  status: 'PENDING' | 'CLONING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  progress: number;
  created_at: string;
}

const statusStyles: Record<AdminJob['status'], string> = {
  PENDING: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
  CLONING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ANALYZING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

interface RecentJobsProps {
  jobs: AdminJob[];
}

export default function RecentJobs({ jobs }: RecentJobsProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
        <Activity className="h-6 w-6 text-slate-700" />
        <p className="text-slate-500 text-sm">No jobs yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800">
      {jobs.map(job => (
        <div
          key={job.id}
          className="flex items-center justify-between py-3 gap-4"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {job.project_repo}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(job.created_at).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {job.status === 'ANALYZING' || job.status === 'CLONING' ? (
              <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            ) : null}
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold tracking-wider ${statusStyles[job.status]}`}
            >
              {job.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
