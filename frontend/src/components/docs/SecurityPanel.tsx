'use client';

import { useState } from 'react';
import { SecurityFinding, FindingSeverity } from '@codeatlas/shared-schema';
import FindingBadge from './FindingBadge';
import {
  Shield,
  ChevronDown,
  ChevronRight,
  FileCode,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';

const SEVERITY_ORDER: FindingSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function groupBySeverity(findings: SecurityFinding[]) {
  return SEVERITY_ORDER.reduce(
    (acc, sev) => {
      acc[sev] = findings.filter(f => f.severity === sev);
      return acc;
    },
    {} as Record<FindingSeverity, SecurityFinding[]>
  );
}

function FindingRow({ finding }: { finding: SecurityFinding }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-900/60 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        )}
        <FindingBadge severity={finding.severity} className="shrink-0" />
        <span className="text-sm font-medium text-slate-200 truncate flex-1 min-w-0">
          {finding.description.slice(0, 90)}
          {finding.description.length > 90 && '…'}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500 shrink-0 ml-2">
          <FileCode className="h-3.5 w-3.5" />
          {finding.file_path.split('/').pop()}
          {finding.line_number != null && `:${finding.line_number}`}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-4 space-y-4">
          {/* File path */}
          <div className="flex items-start gap-2">
            <FileCode className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <code className="text-xs text-slate-400 font-mono break-all">
              {finding.file_path}
              {finding.line_number != null && ` — line ${finding.line_number}`}
            </code>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Description
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {finding.description}
            </p>
          </div>

          {/* Suggested fix */}
          {finding.suggested_fix && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Suggested Fix
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {finding.suggested_fix}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SecurityPanelProps {
  findings: SecurityFinding[];
}

export default function SecurityPanel({ findings }: SecurityPanelProps) {
  const grouped = groupBySeverity(findings);
  const totalCritical = grouped.CRITICAL.length;
  const totalHigh = grouped.HIGH.length;

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Shield className="h-8 w-8 text-emerald-500" />
        <p className="text-slate-300 font-medium">No security issues found</p>
        <p className="text-slate-500 text-sm">This repository looks clean.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SEVERITY_ORDER.map(sev => (
          <div
            key={sev}
            className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-center"
          >
            <p className="text-2xl font-bold text-white">
              {grouped[sev].length}
            </p>
            <FindingBadge severity={sev} className="mt-1" />
          </div>
        ))}
      </div>

      {/* Alert for critical/high */}
      {(totalCritical > 0 || totalHigh > 0) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-300">
            {totalCritical > 0 && (
              <span className="text-red-400 font-semibold">
                {totalCritical} critical
              </span>
            )}
            {totalCritical > 0 && totalHigh > 0 && ' and '}
            {totalHigh > 0 && (
              <span className="text-orange-400 font-semibold">
                {totalHigh} high
              </span>
            )}{' '}
            {totalCritical + totalHigh === 1
              ? 'issue requires'
              : 'issues require'}{' '}
            immediate attention.
          </p>
        </div>
      )}

      {/* Findings by severity */}
      {SEVERITY_ORDER.map(sev =>
        grouped[sev].length === 0 ? null : (
          <div key={sev} className="space-y-2">
            <div className="flex items-center gap-2">
              <FindingBadge severity={sev} />
              <span className="text-xs text-slate-500">
                {grouped[sev].length} finding{grouped[sev].length !== 1 && 's'}
              </span>
            </div>
            <div className="space-y-2">
              {grouped[sev].map(f => (
                <FindingRow key={f.id} finding={f} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
