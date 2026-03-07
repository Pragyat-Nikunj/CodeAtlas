import { z } from 'zod';

const githubRepoRegex =
  /^https:\/\/github\.com\/(?<owner>[A-Za-z0-9_.-]+)\/(?<repo>[A-Za-z0-9_.-]+)(\.git)?\/?$/;

export const ingestProjectSchema = z.object({
  githubUrl: z
    .string()
    .min(1, 'GitHub URL is required')
    .url()
    .refine(url => githubRepoRegex.test(url), {
      message: 'Enter a valid GitHub repository URL',
    })
    .transform(url => {
      const match = url.match(githubRepoRegex);

      if (!match || !match.groups) {
        throw new Error('Invalid GitHub repository URL');
      }

      const { owner, repo } = match.groups;

      return {
        url,
        owner,
        repo: repo.replace('.git', ''),
      };
    }),
});

export type IngestProjectInput = z.infer<typeof ingestProjectSchema>;
