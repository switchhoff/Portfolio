export interface Project {
  id: string;
  label: string;
  zone: string;
  status: "active" | "building" | "deployed" | "field";
  tags: string[];
  summary: string;
  detail: string;
  links: { label: string; url: string }[];
  color: "cyan" | "green" | "copper" | "orange";
}

export const projects: Project[] = [
  {
    id: "bintherestore",
    label: "BinThereStoreThat",
    zone: "Garage",
    status: "active",
    tags: ["hardware", "automation", "iot"],
    summary: "Automated garage storage system. Physical bins, software brain.",
    detail: "Custom automated storage retrieval system built into my garage. Physical bins with position tracking, a control interface, and real-time status — because hunting for things is a solved problem.",
    links: [],
    color: "green",
  },
  {
    id: "habitat",
    label: "Habitat",
    zone: "Living Room",
    status: "deployed",
    tags: ["firebase", "web", "home-automation"],
    summary: "Home automation platform. Real-time, multi-device.",
    detail: "Firebase-backed home automation platform. Tracks device states in real time across the house. Built with Vite, runs on Blaze tier for cloud functions.",
    links: [],
    color: "cyan",
  },
  {
    id: "infraredlaser",
    label: "InfraredLaser",
    zone: "Workshop",
    status: "field",
    tags: ["micropython", "imu", "hardware", "survey"],
    summary: "Field survey tool. Laser + IMU. Built from scratch.",
    detail: "Handheld survey instrument using an infrared laser rangefinder paired with a 9-axis IMU. Logs heading, pitch, roll, and distance to CSV. MicroPython on a custom board with a screen display.",
    links: [],
    color: "orange",
  },
  {
    id: "hoffswitch",
    label: "HoffSwitch",
    zone: "Desk",
    status: "building",
    tags: ["next.js", "typescript", "3d", "portfolio"],
    summary: "This website. Self-referential. Live-synced.",
    detail: "You're looking at it. A point-and-click adventure as a portfolio. 3D house, every room a real project, everything wired to live data. Built with Next.js 15, React Three Fiber, deployed on Vercel.",
    links: [{ label: "hoffswitch.com", url: "https://hoffswitch.com" }],
    color: "cyan",
  },
  {
    id: "vibecode",
    label: "VibecodeDaily",
    zone: "Content Corner",
    status: "active",
    tags: ["obs", "content", "automation"],
    summary: "Daily coding content infrastructure.",
    detail: "OBS recording automation, clip detection scripts, streaming setup. The infrastructure behind daily engineering content creation.",
    links: [],
    color: "copper",
  },
];

export const statusColor: Record<Project["status"], string> = {
  active: "var(--green)",
  building: "var(--cyan)",
  deployed: "var(--cyan)",
  field: "var(--orange)",
};

export const statusLabel: Record<Project["status"], string> = {
  active: "Active",
  building: "In Build",
  deployed: "Deployed",
  field: "Field",
};
