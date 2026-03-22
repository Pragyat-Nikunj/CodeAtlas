'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Project } from '@codeatlas/shared-schema';
import {
  Search,
  GitFork,
  Globe,
  Lock,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 space-y-3 animate-pulse">
      <div className="h-3 w-24 rounded bg-slate-800" />
      <div className="h-5 w-40 rounded bg-slate-800" />
      <div className="h-3 w-full rounded bg-slate-800" />
      <div className="h-3 w-2/3 rounded bg-slate-800" />
    </div>
  );
}

// ── Project card ───────────────────────────────────────────────────────────────
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`/dashboard/projects/${project.id}`}
      className="group block rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:shadow-[0_0_30px_-8px_rgba(99,102,241,0.3)] relative overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
            <GitFork className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {project.owner}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {project.is_public ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <Globe className="h-2.5 w-2.5" /> Public
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-700/40 border border-slate-600/30 px-2 py-0.5 rounded-full">
              <Lock className="h-2.5 w-2.5" /> Private
            </span>
          )}
          <ArrowUpRight
            className={`h-4 w-4 text-slate-600 transition-all duration-200 ${hovered ? 'text-indigo-400 translate-x-0.5 -translate-y-0.5' : ''}`}
          />
        </div>
      </div>

      {/* Repo name */}
      <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors mb-2 font-mono tracking-tight">
        {project.repo}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 group-hover:text-slate-400 transition-colors">
        {project.description ?? 'No description available.'}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-600">
          {new Date(project.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <span className="text-[11px] text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View docs →
        </span>
      </div>
    </a>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-3 text-center">
      <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
        <BookOpen className="h-5 w-5 text-slate-600" />
      </div>
      <p className="text-slate-300 font-medium">
        {query ? `No results for "${query}"` : 'No projects yet'}
      </p>
      <p className="text-slate-600 text-sm max-w-xs">
        {query
          ? 'Try a different search term or browse all projects.'
          : 'Be the first to add a repository to CodeAtlas.'}
      </p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        setState('error');
        return;
      }
      setProjects(data ?? []);
      setFiltered(data ?? []);
      setState('success');
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setFiltered(projects);
      return;
    }
    setFiltered(
      projects.filter(
        p =>
          p.repo.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    );
  }, [query, projects]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Hero section ── */}
      <div className="relative border-b border-slate-800/60 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-600/10 blur-3xl rounded-full" />

        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Public Repository Index
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Explore{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Codebases
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Browse AI-analyzed repositories. Instant documentation, security
            insights, and architecture maps.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by repo, owner, or description…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all backdrop-blur-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
              >
                clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Count */}
        {state === 'success' && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              {filtered.length === 0
                ? 'No results'
                : `${filtered.length} ${filtered.length === 1 ? 'repository' : 'repositories'}`}
              {query && <span className="text-slate-600"> for "{query}"</span>}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state === 'loading' &&
            [...Array(9)].map((_, i) => <SkeletonCard key={i} />)}

          {state === 'error' && (
            <div className="col-span-full text-center py-20 text-slate-500">
              Failed to load projects.
            </div>
          )}

          {state === 'success' && filtered.length === 0 && (
            <EmptyState query={query} />
          )}

          {state === 'success' &&
            filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
        </div>
      </div>
    </div>
  );
}
