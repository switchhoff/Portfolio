export interface Hotspot {
  id: string;
  label: string;
  sublabel: string;
  points: string;   // polygon coords in 2180×1952 image space
  color: string;
  panelContent: PanelContent;
}

export interface PanelContent {
  title: string;
  status: 'active' | 'building' | 'deployed' | 'field';
  tags: string[];
  body: string;
  links?: { label: string; url: string }[];
  liveData?: boolean;
}

// ─── Zones — coordinates in 2180×1952 natural image pixels ───────────────────
// Room layout: left wall = brick (shelves/workbench), right wall = blue multiboard
// Desk with monitors against right wall; chair/dog in centre floor

export const hotspots: Hotspot[] = [
  // ── Chair / About ────────────────────────────────────────────────────────────
  // Centre floor — the tan office chair (isometric floor parallelogram)
  {
    id: 'chair',
    label: 'About',
    sublabel: 'Alex Hofmann',
    color: '#c87941',
    points: '880,1060 1190,900 1280,1180 970,1340',
    panelContent: {
      title: 'Alex Hofmann',
      status: 'active',
      tags: ['FDE', 'Mechatronics', 'Melbourne'],
      body: '24-year-old forward-deployed engineer based in Melbourne, Australia. Master of Electrical Engineering and Bachelor of Mechatronics & Robotics Engineering (AI specialisation), with a Minor in Software Engineering.\n\nI build systems end-to-end — microcontroller firmware and PCB layout through to full-stack platforms and cloud automation pipelines. Background in defence R&D. This workshop is where most of it gets made.',
      links: [
        { label: 'GitHub', url: 'https://github.com/alexhofmann' },
        { label: 'LinkedIn', url: 'https://linkedin.com/in/alexhofmann' },
        { label: 'Email', url: 'mailto:alex@hoffswitch.com' },
      ],
    },
  },

  // ── Monitors / Command Centre ─────────────────────────────────────────────────
  // Right-side desk: three monitors + keyboard + mouse
  {
    id: 'monitors',
    label: 'Command Centre',
    sublabel: 'Triple Monitor Setup',
    color: '#2d6fa3',
    points: '1280,420 2050,420 2050,980 1280,980',
    panelContent: {
      title: 'The Command Centre',
      status: 'active',
      tags: ['Hardware', 'Setup', 'Daily Driver'],
      body: 'Triple monitor setup on the navy L-desk. Left for comms and project management, centre for primary development, right for dashboards and references. Powered by the custom PC tower under the desk.\n\nEverything on the local network runs through the Mercusys switch on the Multiboard wall — clean cable management, everything labelled.',
      liveData: true,
    },
  },

  // ── Workbench ─────────────────────────────────────────────────────────────────
  // The long table running left to right across the room
  {
    id: 'workbench',
    label: 'Workbench',
    sublabel: 'Hardware Build Area',
    color: '#8b6338',
    points: '180,820 1100,820 1100,1380 180,1380',
    panelContent: {
      title: 'The Build Bench',
      status: 'active',
      tags: ['Hardware', 'Electronics', 'Fabrication'],
      body: 'Steel-frame workbench for anything physical. Soldering station, heat press, and hand tools all within arm\'s reach on the Multiboard wall above.\n\nWhere InfraredLaser was assembled, PCBs soldered, and BinThereStoreThat prototypes were stress-tested. If it has wires or requires a vice, it starts here.',
    },
  },

  // ── Shelves / BinThereStoreThat ───────────────────────────────────────────────
  // Upper-left shelving unit — dark boxes stacked above the workbench
  {
    id: 'shelves',
    label: 'BinThereStoreThat',
    sublabel: 'Automated Storage System',
    color: '#2d8a50',
    points: '200,180 820,180 820,820 200,820',
    panelContent: {
      title: 'BinThereStoreThat',
      status: 'active',
      tags: ['IoT', 'Hardware', 'Web', 'Automation'],
      body: 'Automated workshop storage and retrieval system. Bins are RFID-tagged, indexed, and locatable via a web interface. Never lose a component among 2,000 again.\n\nPhysical prototype lives on these shelves. The goal: scan a part number, get a bin location and LED indicator within one second.',
      links: [
        { label: 'GitHub', url: 'https://github.com/alexhofmann/bintherestore' },
      ],
    },
  },

  // ── 3D Printer ───────────────────────────────────────────────────────────────
  // Front-left of workbench — the black FDM printer frame
  {
    id: '3dprinter',
    label: '3D Printer',
    sublabel: 'Rapid Prototyping',
    color: '#2d8a50',
    points: '100,900 580,900 580,1380 100,1380',
    panelContent: {
      title: 'Rapid Prototyping',
      status: 'active',
      tags: ['FDM', 'Fabrication', 'Hardware'],
      body: 'FDM printer for rapid iteration — enclosures, brackets, custom Multiboard mounts, cable clips, jigs.\n\nThe gap between "idea" and "physical prototype holding a circuit board" is measured in hours, not days. Most projects in this room have at least one printed part.',
    },
  },

  // ── Multiboard Wall ───────────────────────────────────────────────────────────
  // Right wall — the large blue octagon-grid panels
  {
    id: 'multiboard',
    label: 'Multiboard Wall',
    sublabel: '11×11 · 121 Tiles',
    color: '#3a5fbf',
    points: '1080,140 2000,140 2000,1200 1080,1200',
    panelContent: {
      title: 'Multiboard System',
      status: 'deployed',
      tags: ['Organisation', 'Workshop', '3D-Printed'],
      body: '121 Multiboard tiles (11×11) covering the right wall. Every mount, bracket, and hook is 3D-printed to the octagonal grid spec — tools, networking gear, and cables all have a deliberate position.\n\nNetworking lives here too: Mercusys managed switch with blinking port LEDs, Ubiquiti AP disc.',
    },
  },

  // ── PC Tower ─────────────────────────────────────────────────────────────────
  // Bottom-right — the black tower under the desk
  {
    id: 'pc',
    label: 'PC Tower',
    sublabel: 'Development Rig',
    color: '#2d6fa3',
    points: '1680,1100 2000,1100 2000,1720 1680,1720',
    panelContent: {
      title: 'The Engine Room',
      status: 'active',
      tags: ['Hardware', 'Compute', 'Daily Driver'],
      body: 'Primary development machine. Compiles embedded firmware, runs local AI models, handles OBS automation for recording, and drives three monitors simultaneously.\n\nThe black tower under the desk quietly doing the heavy lifting.',
      liveData: true,
    },
  },

  // ── Networking ────────────────────────────────────────────────────────────────
  // On the workbench / against the wall — switch + AP
  {
    id: 'networking',
    label: 'Networking',
    sublabel: 'Switch · AP · Infra',
    color: '#2d6fa3',
    points: '480,620 860,620 860,900 480,900',
    panelContent: {
      title: 'Network Infrastructure',
      status: 'deployed',
      tags: ['Networking', 'Ubiquiti', 'Habitat'],
      body: 'Mercusys managed switch and Ubiquiti access point — both mounted on the Multiboard wall with custom 3D-printed brackets.\n\nThe backbone for Habitat and everything else on the local network. VLANs separate IoT devices from the main network.',
      liveData: true,
    },
  },

  // ── Lamp ─────────────────────────────────────────────────────────────────────
  // Far left — floor lamp, still on at midnight
  {
    id: 'lamp',
    label: 'VibecodeDaily',
    sublabel: 'Still on at midnight',
    color: '#b8860b',
    points: '40,900 280,900 280,1850 40,1850',
    panelContent: {
      title: 'VibecodeDaily',
      status: 'active',
      tags: ['Content', 'OBS', 'Engineering'],
      body: 'The lamp that\'s still on at midnight. Also the key light for VibecodeDaily — daily engineering content, build clips, and live coding sessions.\n\nOBS automation handles capture and clipping. The vibe is the output.',
    },
  },

  // ── Easter egg ────────────────────────────────────────────────────────────────
  // The maps/art on the upper left wall — or the sticky note
  {
    id: 'note',
    label: '???',
    sublabel: 'Easter egg',
    color: '#b8860b',
    points: '820,140 1080,140 1080,600 820,600',
    panelContent: {
      title: 'You Found It',
      status: 'active',
      tags: ['Easter Egg'],
      body: 'The sticky note on the wall. It says "ship it."\n\nThat\'s the whole thing. Keep exploring.',
    },
  },
];

export const statusColors: Record<string, string> = {
  active:   '#2d8a50',
  building: '#2d6fa3',
  deployed: '#3a5fbf',
  field:    '#b85c3a',
};

export const statusLabels: Record<string, string> = {
  active:   'Active',
  building: 'In Build',
  deployed: 'Deployed',
  field:    'Field',
};
