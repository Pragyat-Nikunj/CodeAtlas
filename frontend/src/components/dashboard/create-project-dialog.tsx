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
      console.log(`${env.apiUrl}`);
      const res = await fetch(`${env.apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      router.push(`/dashboard/jobs/${data.data.jobId}`);
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
