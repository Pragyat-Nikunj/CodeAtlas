'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, FolderGit2, ShieldAlert, Activity } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}

interface StatsGridProps {
  totalUsers: number;
  totalProjects: number;
  openFindings: number;
  activeJobs: number;
}

export default function StatsGrid({
  totalUsers,
  totalProjects,
  openFindings,
  activeJobs,
}: StatsGridProps) {
  const stats: Stat[] = [
    {
      label: 'Total Users',
      value: totalUsers,
      sub: 'Registered accounts',
      icon: <Users className="h-4 w-4" />,
      accent: 'text-indigo-400',
    },
    {
      label: 'Total Projects',
      value: totalProjects,
      sub: 'Ingested repositories',
      icon: <FolderGit2 className="h-4 w-4" />,
      accent: 'text-violet-400',
    },
    {
      label: 'Open Findings',
      value: openFindings,
      sub: 'Security issues unresolved',
      icon: <ShieldAlert className="h-4 w-4" />,
      accent: 'text-rose-400',
    },
    {
      label: 'Active Jobs',
      value: activeJobs,
      sub: 'Currently running',
      icon: <Activity className="h-4 w-4" />,
      accent: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => (
        <Card
          key={stat.label}
          className="bg-slate-900/60 border-slate-800 backdrop-blur-sm"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className={`${stat.accent} bg-slate-800 p-1.5 rounded-md`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-white tabular-nums">
              {stat.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
