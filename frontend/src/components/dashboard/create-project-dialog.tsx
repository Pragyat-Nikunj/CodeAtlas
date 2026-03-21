'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2 } from 'lucide-react';
import env from '@/lib/env';
import { createClient } from '@/utils/supabase/client';

export default function CreateProjectDialog() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidGithubUrl = (value: string) => {
    return /^https:\/\/github\.com\/[^/]+\/[^/]+/.test(value.trim());
  };

  const handleSubmit = async () => {
    setError(null);

    if (!url.trim()) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    if (!isValidGithubUrl(url)) {
      setError('Enter a valid GitHub URL (e.g. https://github.com/user/repo).');
      return;
    }

    setLoading(true);

    try {
      // ── Pre-flight: verify repo exists on GitHub ──────────────────────
      const match = url.trim().match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const [, owner, repo] = match;
        const ghRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo.replace('.git', '')}`
        );
        if (ghRes.status === 404) {
          setError("This GitHub repository doesn't exist or is private.");
          setLoading(false);
          return;
        }
      }
      // ─────────────────────────────────────────────────────────────────

      const supabase = createClient();
      const { data: authData } = await supabase.auth.getSession();
      const session = authData.session;

      if (!session) {
        setError('You must be logged in to add a project.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${env.apiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ githubUrl: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.message ||
            data?.error ||
            'Something went wrong. Please try again.'
        );
        return;
      }

      if (!data?.data?.jobId) {
        setError('Unexpected response from server. Please try again.');
        return;
      }

      router.push(`/dashboard/projects/${data.data.projectId}`);
    } catch (err) {
      setError('Network error — check your connection and try again.');
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUrl('');
      setError(null);
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Project</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add GitHub Repo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="https://github.com/user/repo"
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
            disabled={loading}
            aria-invalid={!!error}
            className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-500">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : (
              'Start Analysis'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
