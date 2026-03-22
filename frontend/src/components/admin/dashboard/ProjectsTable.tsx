'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FolderGit2 } from 'lucide-react';

export interface AdminProject {
  id: string;
  owner: string;
  repo: string;
  github_url: string;
  is_public: boolean;
  created_at: string;
}

interface ProjectsTableProps {
  projects: AdminProject[];
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <FolderGit2 className="h-6 w-6 text-slate-700" />
        <p className="text-slate-500 text-sm">No projects yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">
              Repository
            </TableHead>
            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">
              Visibility
            </TableHead>
            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">
              Added
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map(project => (
            <TableRow
              key={project.id}
              className="border-slate-800 hover:bg-slate-900/40 transition-colors"
            >
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {project.owner}/{project.repo}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    project.is_public
                      ? 'text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'text-[10px] bg-slate-700/40 text-slate-400 border-slate-600/30'
                  }
                >
                  {project.is_public ? 'Public' : 'Private'}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 text-sm hidden lg:table-cell">
                {new Date(project.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  asChild
                  className="h-8 w-8 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  <a href={project.github_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
