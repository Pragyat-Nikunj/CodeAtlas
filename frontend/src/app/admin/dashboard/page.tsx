'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import StatsGrid from '@/components/admin/dashboard/StatsGrid';
import UsersTable, { AdminUser } from '@/components/admin/dashboard/UsersTable';
import ProjectsTable, {
  AdminProject,
} from '@/components/admin/dashboard/ProjectsTable';
import RecentJobs, { AdminJob } from '@/components/admin/dashboard/RecentJobs';
import SecurityPanel, {
  FindingsSummary,
} from '@/components/admin/dashboard/SecurityPanel';

type LoadState = 'loading' | 'success' | 'error';

export default function AdminPage() {
  const supabase = createClient();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [findingsSummary, setFindingsSummary] = useState<FindingsSummary>({
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  });
  const [openFindings, setOpenFindings] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);

  const fetchAll = async () => {
    setLoadState('loading');
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });
      if (profilesError) throw profilesError;

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(
          'id, owner, repo, github_url, is_public, created_at, creator_id'
        )
        .order('created_at', { ascending: false });
      if (projectsError) throw projectsError;

      const profileMap = new Map(
        (profilesData ?? []).map(p => [p.id, p.email])
      );
      const enrichedProjects: AdminProject[] = (projectsData ?? []).map(p => ({
        ...p,
        creator_email: p.creator_id
          ? (profileMap.get(p.creator_id) ?? null)
          : null,
      }));

      const { data: jobsData, error: jobsError } = await supabase
        .from('ingestion_jobs')
        .select('id, project_id, status, progress, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (jobsError) throw jobsError;

      const projectMap = new Map(
        enrichedProjects.map(p => [p.id, `${p.owner}/${p.repo}`])
      );
      const enrichedJobs: AdminJob[] = (jobsData ?? []).map(j => ({
        id: j.id,
        project_repo: projectMap.get(j.project_id) ?? j.project_id,
        status: j.status,
        progress: j.progress,
        created_at: j.created_at,
      }));

      const { data: findingsData, error: findingsError } = await supabase
        .from('security_findings')
        .select('severity, status');
      if (findingsError) throw findingsError;

      const openOnly = (findingsData ?? []).filter(f => f.status === 'OPEN');
      const summary: FindingsSummary = {
        CRITICAL: openOnly.filter(f => f.severity === 'CRITICAL').length,
        HIGH: openOnly.filter(f => f.severity === 'HIGH').length,
        MEDIUM: openOnly.filter(f => f.severity === 'MEDIUM').length,
        LOW: openOnly.filter(f => f.severity === 'LOW').length,
      };

      const running = enrichedJobs.filter(
        j =>
          j.status === 'PENDING' ||
          j.status === 'CLONING' ||
          j.status === 'ANALYZING'
      ).length;

      setUsers(profilesData as AdminUser[]);
      setProjects(enrichedProjects);
      setJobs(enrichedJobs);
      setFindingsSummary(summary);
      setOpenFindings(openOnly.length);
      setActiveJobs(running);
      setLoadState('success');
    } catch (err) {
      console.error(err);
      setLoadState('error');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        {/* Page title — inline, no separate component */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Admin</h1>
          <Badge
            variant="outline"
            className="text-[10px] font-bold tracking-widest bg-rose-500/10 text-rose-400 border-rose-500/20"
          >
            SUPERADMIN
          </Badge>
        </div>

        <div className="h-px bg-slate-800" />

        {loadState === 'loading' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg bg-slate-800" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg bg-slate-800" />
          </div>
        )}

        {loadState === 'error' && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="text-slate-300 font-medium">
              Failed to load admin data
            </p>
            <p className="text-slate-500 text-sm">
              Check your Supabase RLS policies.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAll}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {loadState === 'success' && (
          <>
            <StatsGrid
              totalUsers={users.length}
              totalProjects={projects.length}
              openFindings={openFindings}
              activeJobs={activeJobs}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Tabs defaultValue="users">
                  <TabsList className="bg-slate-900 border border-slate-800">
                    <TabsTrigger
                      value="users"
                      className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
                    >
                      Users
                    </TabsTrigger>
                    <TabsTrigger
                      value="projects"
                      className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
                    >
                      Projects
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="users" className="mt-4">
                    <UsersTable
                      users={users}
                      onUserDeleted={id =>
                        setUsers(prev => prev.filter(u => u.id !== id))
                      }
                    />
                  </TabsContent>

                  <TabsContent value="projects" className="mt-4">
                    <ProjectsTable projects={projects} />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card className="bg-slate-900/60 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-300">
                      Open Security Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SecurityPanel
                      summary={findingsSummary}
                      total={openFindings}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-300">
                      Recent Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <RecentJobs jobs={jobs} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
