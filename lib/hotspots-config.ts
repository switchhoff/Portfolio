import hotspots from '@/lib/hotspots.json';

// ─── Base ────────────────────────────────────────────────────────────────────
interface BaseHotspot {
  id: string;
  label: string;
  svgElement: string;
  color: string;
  category: string;
  type: string;
  points: string; // polygon coords in image space: "x1,y1 x2,y2 ..."
}

// ─── Type-specific interfaces ────────────────────────────────────────────────
export interface ProjectHotspot extends BaseHotspot {
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

export interface PopupHotspot extends BaseHotspot {
  type: 'popup';
  popup: {
    title: string;
    items: Array<{ name: string; [key: string]: any }>;
  };
}

export interface ExperienceHotspot extends BaseHotspot {
  type: 'experience';
  experience: {
    title: string;
    period?: string;
    role?: string;
    description?: string;
    items?: Array<{ degree?: string; institution?: string; period?: string; note?: string }>;
    tags?: string[];
    media?: { type: 'video'; src: string };
  };
}

export interface LinkHotspot extends BaseHotspot {
  type: 'link';
  link: {
    title: string;
    description: string;
    url: string;
    text: string;
  };
}

export interface FormHotspot extends BaseHotspot {
  type: 'form';
  form: {
    title: string;
    description: string;
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'email' | 'textarea';
      required: boolean;
    }>;
  };
}

export interface StatusHotspot extends BaseHotspot {
  type: 'status';
  note?: string;
  status: {
    title: string;
    description: string;
    liveData: boolean;
    location?: string;
    dynamicBackground?: boolean;
    backgroundConditions?: Record<string, string>;
    fields: Array<{
      label: string;
      value: string;
      source?: string;
    }>;
  };
}

export interface AboutHotspot extends BaseHotspot {
  type: 'about';
  about: {
    name: string;
    tagline: string;
    tags: string[];
    bio: string;
    links: Array<{ label: string; url: string }>;
  };
}

// ─── Union ───────────────────────────────────────────────────────────────────
export type Hotspot =
  | ProjectHotspot
  | PopupHotspot
  | ExperienceHotspot
  | LinkHotspot
  | FormHotspot
  | StatusHotspot
  | AboutHotspot;

// ─── Accessors ───────────────────────────────────────────────────────────────
export function getHotspots(): Hotspot[] {
  return hotspots as Hotspot[];
}

export function getMappedHotspots(): Hotspot[] {
  return (hotspots as Hotspot[]).filter(h => h.points !== '');
}

export function getHotspotById(id: string): Hotspot | undefined {
  return (hotspots as any[]).find(h => h.id === id);
}

export function getHotspotsByCategory(category: string): Hotspot[] {
  return (hotspots as any[]).filter(h => h.category === category);
}

// ─── Type guards ─────────────────────────────────────────────────────────────
export function isProject(h: Hotspot): h is ProjectHotspot { return h.type === 'project'; }
export function isPopup(h: Hotspot): h is PopupHotspot { return h.type === 'popup'; }
export function isExperience(h: Hotspot): h is ExperienceHotspot { return h.type === 'experience'; }
export function isLink(h: Hotspot): h is LinkHotspot { return h.type === 'link'; }
export function isForm(h: Hotspot): h is FormHotspot { return h.type === 'form'; }
export function isStatus(h: Hotspot): h is StatusHotspot { return h.type === 'status'; }
export function isAbout(h: Hotspot): h is AboutHotspot { return h.type === 'about'; }

// ─── Categories ──────────────────────────────────────────────────────────────
export interface CheatGuideCategory {
  id: string;
  label: string;
  color: string;
  description: string;
}

export const CHEAT_GUIDE_CATEGORIES: CheatGuideCategory[] = [
  { id: 'about',      label: 'About',       color: '#2d5a3d', description: 'Bio & background' },
  { id: 'interests',  label: 'Interests',   color: '#8e44ad', description: 'Games & favourite books' },
  { id: 'projects',   label: 'Projects',    color: '#3498db', description: 'Apps, games, portfolio projects' },
  { id: 'education',  label: 'Education',   color: '#e67e22', description: 'Academic background' },
  { id: 'experience', label: 'Experience',  color: '#e74c3c', description: 'Professional work' },
];

export function getCategoryColor(category: string): string {
  return CHEAT_GUIDE_CATEGORIES.find(c => c.id === category)?.color || '#999';
}
