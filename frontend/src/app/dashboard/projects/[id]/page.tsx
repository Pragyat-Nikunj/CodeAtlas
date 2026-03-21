'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Project,
  IngestionJob,
  DocumentationNode,
  SecurityFinding,
  StructuralManifest,
} from '@codeatlas/shared-schema';

import JobProgress from '@/components/docs/JobProgress';
import PillarNav, { ActiveSection } from '@/components/docs/PillarNav';
import MobileNav from '@/components/docs/MobileNav';
import { OverviewSection, PillarDetail } from '@/components/docs/DocContent';
import SecurityPanel from '@/components/docs/SecurityPanel';
import DocsChat from '@/components/docs/DocsChat';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Shield,
  GitBranch,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import env from '@/lib/env';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocsData {
  project: Project;
  manifest: StructuralManifest;
  nodes: DocumentationNode[];
  findings: SecurityFinding[];
}

type PageState = 'loading' | 'analyzing' | 'ready' | 'error';

const POLL_INTERVAL = 3000;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId'); // passed from CreateProjectDialog redirect

  const [pageState, setPageState] = useState<PageState>('loading');
  const [job, setJob] = useState<IngestionJob | null>(null);
  const [docs, setDocs] = useState<DocsData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');

  // Prevent overlapping poll ticks
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStopped = useRef(false);

  // ── Fetch final docs ───────────────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    try {
      const [projectRes, nodesRes, securityRes] = await Promise.all([
        fetch(`${env.apiUrl}/api/projects/${id}`),
        fetch(`${env.apiUrl}/api/projects/${id}/nodes`),
        fetch(`${env.apiUrl}/api/projects/${id}/security`),
      ]);

      if (!projectRes.ok) throw new Error('Failed to load project');

      const projectData = await projectRes.json();
      const nodesData = nodesRes.ok ? await nodesRes.json() : { data: [] };
      const securityData = securityRes.ok
        ? await securityRes.json()
        : { data: [] };

      const project: Project = projectData.data;
      const nodes: DocumentationNode[] = nodesData.data ?? [];
      const findings: SecurityFinding[] = securityData.data ?? [];

      const summaryNode = nodes.find(n => n.type === 'SUMMARY');
      const pillarNodes = nodes.filter(n => n.type === 'PILLAR');

      const manifest: StructuralManifest = {
        projectName: project.repo,
        highLevelSummary:
          summaryNode?.content ??
          project.description ??
          'No summary available.',
        quickStart: `# Clone\ngit clone ${project.github_url}\n\n# Install & run\nnpm install\nnpm run dev`,
        pillars: pillarNodes.map(n => ({
          name: n.title,
          description: n.content ?? '',
          associatedFiles: [],
        })),
      };

      setDocs({ project, manifest, nodes, findings });
      setPageState('ready');
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? 'Failed to load documentation.');
      setPageState('error');
    }
  }, [id]);

  // ── Poll tick ─────────────────────────────────────────────────────────────
  const tick = useCallback(async () => {
    if (isStopped.current) return;

    // No jobId in URL — project already completed before, just load docs
    if (!jobId) {
      await fetchDocs();
      return;
    }

    try {
      const res = await fetch(`${env.apiUrl}/api/jobs/${jobId}`);

      if (!res.ok) {
        // Job not found — assume completed long ago, try loading docs directly
        await fetchDocs();
        return;
      }

      const data = await res.json();
      const latestJob: IngestionJob = data.data;
      setJob(latestJob);

      if (latestJob.status === 'COMPLETED') {
        await fetchDocs();
      } else if (latestJob.status === 'FAILED') {
        isStopped.current = true;
        setErrorMsg(
          latestJob.error_message ?? 'Analysis failed. Please try again.'
        );
        setPageState('error');
      } else {
        // PENDING | CLONING | ANALYZING — keep polling
        setPageState('analyzing');
        if (!isStopped.current) {
          timerRef.current = setTimeout(tick, POLL_INTERVAL);
        }
      }
    } catch {
      // Network blip — retry silently
      if (!isStopped.current) {
        timerRef.current = setTimeout(tick, POLL_INTERVAL);
      }
    }
  }, [jobId, fetchDocs]);

  // ── Start polling on mount ────────────────────────────────────────────────
  useEffect(() => {
    isStopped.current = false;
    tick();

    return () => {
      isStopped.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tick]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (pageState === 'analyzing' && job) {
    return <JobProgress job={job} />;
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <div>
            <p className="text-white font-medium">Something went wrong</p>
            <p className="text-slate-500 text-sm mt-1">{errorMsg}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocs}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!docs) return null;

  const { project, manifest, nodes, findings } = docs;
  const pillarIndex = activeSection.startsWith('pillar-')
    ? parseInt(activeSection.replace('pillar-', ''))
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Project header */}
      <div className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight truncate">
                {project.owner}/{project.repo}
              </h1>
              <Badge
                variant="outline"
                className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] uppercase tracking-wider"
              >
                Public
              </Badge>
            </div>
            {project.description && (
              <p className="text-slate-500 text-sm truncate max-w-lg">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {findings.length > 0 && (
              <button
                onClick={() => setActiveSection('security')}
                className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                {findings.length} finding{findings.length !== 1 && 's'}
              </button>
            )}
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <GitBranch className="h-3.5 w-3.5" />
              View on GitHub
              <ExternalLink className="h-3 w-3 text-slate-600" />
            </a>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 mx-auto w-full max-w-7xl">
        <PillarNav
          projectName={manifest.projectName}
          pillars={manifest.pillars}
          securityCount={findings.length}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <main className="flex-1 min-w-0">
          <MobileNav
            pillars={manifest.pillars}
            securityCount={findings.length}
            activeSection={activeSection}
            onSelect={setActiveSection}
          />

          <div className="px-6 sm:px-8 py-8 max-w-3xl">
            {activeSection === 'overview' && (
              <OverviewSection
                summary={manifest.highLevelSummary}
                quickStart={manifest.quickStart}
                pillars={manifest.pillars}
                onSelectPillar={i =>
                  setActiveSection(`pillar-${i}` as ActiveSection)
                }
              />
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white tracking-tight">
                    Security Audit
                  </h2>
                </div>
                <Separator className="bg-slate-800" />
                <SecurityPanel findings={findings} />
              </div>
            )}

            {pillarIndex !== null && manifest.pillars[pillarIndex] && (
              <PillarDetail
                pillar={manifest.pillars[pillarIndex]}
                nodes={nodes}
              />
            )}
          </div>
        </main>

        {/* Right panel — AI chat */}
        <DocsChat manifest={manifest} nodes={nodes} findings={findings} />
      </div>
    </div>
  );
}
