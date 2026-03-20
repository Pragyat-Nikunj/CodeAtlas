'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@codeatlas/shared-schema';
import { GitFork, Clock } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-150"
      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white truncate">
          {project.repo}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center justify-between text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <GitFork className="h-3.5 w-3.5" />
          {project.owner}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {timeAgo(project.created_at)}
        </span>
      </CardContent>
    </Card>
  );
}
