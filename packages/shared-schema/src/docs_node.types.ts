export type NodeType = 'PILLAR' | 'SUMMARY' | 'FILE_DOC';

export interface DocumentationNode {
  id: string;
  project_id: string;
  parent_id?: string | null;
  title: string;
  content?: string | null;
  type: NodeType;
  is_edited_by_admin: boolean;
  created_at: string;
}
