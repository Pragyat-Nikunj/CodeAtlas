import { FindingSeverity } from '@codeatlas/shared-schema';
import { cn } from '@/lib/utils';

const CONFIG: Record<FindingSeverity, { label: string; classes: string }> = {
  CRITICAL: {
    label: 'Critical',
    classes: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  HIGH: {
    label: 'High',
    classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  MEDIUM: {
    label: 'Medium',
    classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  LOW: {
    label: 'Low',
    classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
};

export default function FindingBadge({
  severity,
  className,
}: {
  severity: FindingSeverity;
  className?: string;
}) {
  const config = CONFIG[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
