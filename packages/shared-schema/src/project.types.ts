export interface Project {
  id: string;
  github_url: string;
  owner: string;
  repo: string;
  description?: string | null;
  creator_id?: string | null;
  is_public: boolean;
  created_at: string;
}
