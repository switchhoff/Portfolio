import hotspots from '@/lib/hotspots.json';

export interface ProjectHotspot {
  id: string;
  label: string;
  svgElement: string;
  color: string;
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
  type: 'popup';
  popup: {
    title: string;
    items: Array<{ name: string; [key: string]: any }>;
  };
}

export type Hotspot = ProjectHotspot | PopupHotspot;

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
