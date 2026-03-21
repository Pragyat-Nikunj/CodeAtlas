'use client';

import { cn } from '@/lib/utils';
import { Shield, BookOpen, Layers, FileText } from 'lucide-react';
import { Pillar } from '@codeatlas/shared-schema';

export type ActiveSection = 'overview' | 'security' | `pillar-${string}`;

interface PillarNavProps {
  projectName: string;
  pillars: Pillar[];
  securityCount: number;
  activeSection: ActiveSection;
  onSelect: (section: ActiveSection) => void;
}

export default function PillarNav({
  projectName,
  pillars,
  securityCount,
  activeSection,
  onSelect,
}: PillarNavProps) {
  return (
    <aside className="w-60 shrink-0 hidden lg:flex flex-col border-r border-slate-800 bg-slate-950/80 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 px-3">
      {/* Project name */}
      <div className="px-3 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="text-sm font-semibold text-white truncate">
            {projectName}
          </span>
        </div>
      </div>

      <div className="space-y-0.5">
        <NavItem
          icon={<Layers className="h-4 w-4" />}
          label="Overview"
          active={activeSection === 'overview'}
          onClick={() => onSelect('overview')}
        />

        {/* Pillars */}
        {pillars.length > 0 && (
          <div className="pt-3 pb-1 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Architecture
            </p>
          </div>
        )}
        {pillars.map((pillar, i) => (
          <NavItem
            key={i}
            icon={<FileText className="h-4 w-4" />}
            label={pillar.name}
            active={activeSection === `pillar-${i}`}
            onClick={() => onSelect(`pillar-${i}` as ActiveSection)}
          />
        ))}

        {/* Security */}
        <div className="pt-3 pb-1 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Security
          </p>
        </div>
        <NavItem
          icon={<Shield className="h-4 w-4" />}
          label="Security Audit"
          active={activeSection === 'security'}
          onClick={() => onSelect('security')}
          badge={securityCount > 0 ? securityCount : undefined}
        />
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-left transition-colors',
        active
          ? 'bg-indigo-500/10 text-indigo-300 font-medium'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
      )}
    >
      <span
        className={cn(
          'shrink-0',
          active ? 'text-indigo-400' : 'text-slate-600'
        )}
      >
        {icon}
      </span>
      <span className="truncate flex-1">{label}</span>
      {badge !== undefined && (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/15 px-1.5 text-[10px] font-bold text-red-400">
          {badge}
        </span>
      )}
    </button>
  );
}
