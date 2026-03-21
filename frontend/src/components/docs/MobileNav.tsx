'use client';

import { ActiveSection } from './PillarNav';
import { Pillar } from '@codeatlas/shared-schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MobileNavProps {
  pillars: Pillar[];
  securityCount: number;
  activeSection: ActiveSection;
  onSelect: (section: ActiveSection) => void;
}

export default function MobileNav({
  pillars,
  securityCount,
  activeSection,
  onSelect,
}: MobileNavProps) {
  const sectionLabel = (s: ActiveSection): string => {
    if (s === 'overview') return 'Overview';
    if (s === 'security') return 'Security Audit';
    const idx = parseInt(s.replace('pillar-', ''));
    return pillars[idx]?.name ?? 'Pillar';
  };

  return (
    <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 py-2 sticky top-16 z-10">
      <Select
        value={activeSection}
        onValueChange={v => onSelect(v as ActiveSection)}
      >
        <SelectTrigger className="w-full border-slate-800 bg-slate-900 text-slate-200 text-sm">
          <SelectValue>{sectionLabel(activeSection)}</SelectValue>
        </SelectTrigger>
        <SelectContent className="border-slate-800 bg-slate-900 text-slate-200">
          <SelectItem value="overview">Overview</SelectItem>
          {pillars.map((p, i) => (
            <SelectItem key={i} value={`pillar-${i}`}>
              {p.name}
            </SelectItem>
          ))}
          <SelectItem value="security">
            Security Audit{securityCount > 0 ? ` (${securityCount})` : ''}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
