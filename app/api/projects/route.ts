import { getProjects } from '@/lib/projects';

export async function GET() {
  try {
    const projects = getProjects();
    return Response.json(projects);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
