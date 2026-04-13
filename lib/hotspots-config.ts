import hotspots from '@/lib/hotspots.json';

export interface ProjectHotspot {
  id: string;
  label: string;
  svgElement: string;
  color: string;
  category: string;
  type: 'project';
  project: {
    name: string;
    repo: string | null;
    tagline: string;
    tags: string[];
    description: string;
    link?: string;
  };
}

export interface PopupHotspot {
  id: string;
  label: string;
  svgElement: string;
  color: string;
  category: string;
  type: 'popup';
  popup: {
    title: string;
    items: Array<{ name: string; [key: string]: any }>;
  };
}

export interface ExperienceHotspot {
  id: string;
  label: string;
  svgElement: string;
  color: string;
  category: string;
  type: 'experience';
  experience: {
    title: string;
    period?: string;
    role?: string;
    description?: string;
    items?: Array<{ degree?: string; institution?: string; period?: string; note?: string }>;
    tags?: string[];
  };
}

export type Hotspot = ProjectHotspot | PopupHotspot | ExperienceHotspot;

export function getHotspots(): Hotspot[] {
  return hotspots as Hotspot[];
}

export function getHotspotById(id: string): Hotspot | undefined {
  return hotspots.find((h: any) => h.id === id);
}

export function isProject(h: Hotspot): h is ProjectHotspot {
  return h.type === 'project';
}

export function isPopup(h: Hotspot): h is PopupHotspot {
  return h.type === 'popup';
}

export function isExperience(h: Hotspot): h is ExperienceHotspot {
  return h.type === 'experience';
}

export interface CheatGuideCategory {
  id: string;
  label: string;
  color: string;
  description: string;
}

export const CHEAT_GUIDE_CATEGORIES: CheatGuideCategory[] = [
  {
    id: 'projects',
    label: 'Projects',
    color: '#3498db',
    description: 'Apps, games, portfolio projects'
  },
  {
    id: 'experience',
    label: 'Experience',
    color: '#e74c3c',
    description: 'Education & professional work'
  },
  {
    id: 'popups',
    label: 'Interests',
    color: '#f1c40f',
    description: 'Games & favourite books'
  },
  {
    id: 'about',
    label: 'About',
    color: '#2d5a3d',
    description: 'Bio & background'
  }
];

export function getHotspotsByCategory(category: string): Hotspot[] {
  return hotspots.filter((h: any) => h.category === category);
}

export function getCategoryColor(category: string): string {
  return CHEAT_GUIDE_CATEGORIES.find(c => c.id === category)?.color || '#999';
}
