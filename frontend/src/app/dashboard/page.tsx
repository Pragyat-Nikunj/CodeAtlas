'use client';

import { useEffect, useState } from 'react';
import { Project } from '@codeatlas/shared-schema';
import ProjectCard from '@/components/dashboard/project-card';
import CreateProjectDialog from '@/components/dashboard/create-project-dialog';
import SearchBar from '@/components/dashboard/searchbar';
import { useAuth } from '@/providers/AuthContext';
import { FolderGit2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import env from '@/lib/env';

type State = 'loading' | 'success' | 'error';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [query, setQuery] = useState('');

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'User';

  async function fetchProjects(search = '') {
    setState('loading');
    setErrorMsg('');
    try {
      const url = search.trim()
        ? `${env.apiUrl}/api/projects?search=${encodeURIComponent(search.trim())}`
        : `${env.apiUrl}/api/projects`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      setProjects(data?.data ?? []);
      setState('success');
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? 'Something went wrong.');
      setState('error');
    }
  }

  // Debounce search — wait 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back, {firstName}</p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Search */}
        <SearchBar value={query} onChange={setQuery} />

        {/* Divider */}
        <div className="h-px bg-slate-800" />

        {/* Loading */}
        {state === 'loading' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[88px] rounded-lg border border-slate-800 bg-slate-900/40 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-16 text-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <p className="text-slate-200 font-medium">Failed to load projects</p>
              <p className="text-slate-500 text-sm mt-0.5">{errorMsg}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProjects(query)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5 mt-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty */}
        {state === 'success' && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 py-20 text-center gap-2">
            <FolderGit2 className="h-7 w-7 text-slate-700" />
            <p className="text-slate-400 font-medium">
              {query ? `No results for "${query}"` : 'No projects yet'}
            </p>
            <p className="text-slate-600 text-sm">
              {query ? 'Try a different search term.' : 'Add a GitHub repo to get started.'}
            </p>
          </div>
        )}

        {/* Grid */}
        {state === 'success' && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}