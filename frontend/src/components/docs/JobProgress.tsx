'use client';

import { useEffect, useState } from 'react';
import { IngestionJob } from '@codeatlas/shared-schema';
import {
  Loader2,
  GitBranch,
  Brain,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const STEPS: {
  status: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    status: 'CLONING',
    label: 'Cloning Repository',
    icon: <GitBranch className="h-4 w-4" />,
    description: 'Pulling source files from GitHub…',
  },
  {
    status: 'ANALYZING',
    label: 'Analyzing Codebase',
    icon: <Brain className="h-4 w-4" />,
    description: 'AI is mapping architecture and security…',
  },
  {
    status: 'COMPLETED',
    label: 'Documentation Ready',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Your docs are live.',
  },
];

const STATUS_ORDER = ['PENDING', 'CLONING', 'ANALYZING', 'COMPLETED'];

function getStepIndex(status: string) {
  return STATUS_ORDER.indexOf(status);
}

interface JobProgressProps {
  job: IngestionJob;
}

export default function JobProgress({ job }: JobProgressProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = getStepIndex(job.status);
  const isFailed = job.status === 'FAILED';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          {isFailed ? (
            <XCircle className="h-10 w-10 text-red-400 mx-auto" />
          ) : (
            <div className="relative mx-auto w-10 h-10">
              <Zap className="h-10 w-10 text-indigo-400 mx-auto" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-indigo-500 animate-ping" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-white tracking-tight">
            {isFailed ? 'Analysis Failed' : `Processing${dots}`}
          </h2>
          <p className="text-slate-500 text-sm">
            {isFailed
              ? (job.error_message ?? 'An unexpected error occurred.')
              : 'Hang tight — this usually takes under a minute.'}
          </p>
        </div>

        {/* Progress bar */}
        {!isFailed && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <Progress
              value={job.progress}
              className="h-1.5 bg-slate-800 [&>div]:bg-indigo-500 [&>div]:transition-all [&>div]:duration-700"
            />
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const stepIndex = i + 1; // PENDING=0, CLONING=1, ANALYZING=2, COMPLETED=3
            const done = currentIndex > stepIndex;
            const active = currentIndex === stepIndex && !isFailed;
            const pending = currentIndex < stepIndex;

            return (
              <div
                key={step.status}
                className={cn(
                  'flex items-start gap-3 rounded-lg border px-4 py-3 transition-all duration-300',
                  active && 'border-indigo-500/30 bg-indigo-500/5',
                  done && 'border-slate-800 bg-slate-900/40',
                  pending && 'border-slate-800/50 bg-transparent opacity-40',
                  isFailed && 'opacity-30'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                    active &&
                      'border-indigo-500 bg-indigo-500/10 text-indigo-400',
                    done &&
                      'border-emerald-600 bg-emerald-600/10 text-emerald-400',
                    pending && 'border-slate-700 text-slate-600'
                  )}
                >
                  {active ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : done ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      active && 'text-white',
                      done && 'text-slate-300',
                      pending && 'text-slate-600'
                    )}
                  >
                    {step.label}
                  </p>
                  {active && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
