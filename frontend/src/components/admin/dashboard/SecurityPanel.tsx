'use client';

import { ShieldAlert } from 'lucide-react';

export interface FindingsSummary {
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

interface SecurityPanelProps {
  summary: FindingsSummary;
  total: number;
}

const severityConfig = [
  {
    key: 'CRITICAL' as const,
    label: 'Critical',
    bar: 'bg-rose-500',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    key: 'HIGH' as const,
    label: 'High',
    bar: 'bg-orange-500',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    key: 'MEDIUM' as const,
    label: 'Medium',
    bar: 'bg-amber-500',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    key: 'LOW' as const,
    label: 'Low',
    bar: 'bg-slate-500',
    text: 'text-slate-400',
    bg: 'bg-slate-700/40',
  },
];

export default function SecurityPanel({ summary, total }: SecurityPanelProps) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
        <ShieldAlert className="h-6 w-6 text-slate-700" />
        <p className="text-slate-500 text-sm">No findings recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {severityConfig.map(({ key, label, bar, text, bg }) => {
        const count = summary[key];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${bg} ${text}`}
                >
                  {label}
                </span>
              </div>
              <span className="text-slate-400 tabular-nums text-sm font-medium">
                {count}
                <span className="text-slate-600 text-xs ml-1">({pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${bar} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-500">
        <span>Total open findings</span>
        <span className="font-semibold text-slate-300">{total}</span>
      </div>
    </div>
  );
}
