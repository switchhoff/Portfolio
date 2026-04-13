import projects from '@/projects.json';

export interface Project {
  id: string;
  repo: string;
  name: string;
  tagline: string;
  tags: string[];
  color: string;
  firebase: string | null;
  stars?: number;
  updated?: string;
}

export function getProjects(): Project[] {
  return projects as Project[];
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p: any) => p.id === id);
}
