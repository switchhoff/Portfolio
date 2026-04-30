# Portfolio

> An interactive isometric workshop — point and click your way through my projects.

<p align="center">
  <img src="https://img.shields.io/badge/Live-offswitch.au-brightgreen" />
  <img src="https://img.shields.io/badge/Next.js-App_Router-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Three.js-3D_Scene-black?logo=threedotjs" />
  <img src="https://img.shields.io/badge/Firebase-Hosting-orange?logo=firebase" />
</p>

---

Not a typical portfolio. Instead of a scrolling page of cards, it's a 3D isometric workshop scene. Click on objects around the room to discover projects, read the resume, check the bookshelf, see the photography — each hotspot in the scene opens a different piece of content.

---

## Scene Hotspots

| Object | Content |
|---|---|
| Computer / screens | Projects — live links, tags, descriptions |
| Desk / resume | About me — skills, experience, timeline |
| Bookshelf | Reading list + influences |
| Camera | Photography — Instagram links |
| Golf bag | Hobbies / personal |
| Status board | Current weather + status |
| Workshop tools | Side projects + hardware builds |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, static export) |
| 3D scene | Three.js — isometric SVG-based scene |
| Styling | Tailwind CSS |
| Data | `projects.json` + `lib/hotspots.json` — content config |
| Backend | Firebase Firestore (golf request form) |
| Hosting | Firebase Hosting |
| Language | TypeScript |

---

## Project Structure

```
app/
  page.tsx               # Main workshop scene
  layout.tsx             # Meta, fonts, theme
  visualizer/            # Dev tool — SVG block mapper
  api/projects/          # Projects JSON endpoint
components/
  workshop/
    WorkshopScene.tsx    # Main Three.js / SVG scene
  modals/                # Hotspot content panels
    StatusContent.tsx    # Weather + status hotspot
  resume/
    BoringView.tsx       # Classic resume fallback view
  GkLogo.tsx
  SVGVisualizer.tsx
lib/
  hotspots.json          # Scene hotspot definitions + content
  pathData.ts            # Navigation + link data
  svgBlockMappings.ts    # SVG object → hotspot mapping
public/
  Room.svg               # Main isometric scene SVG
  OffswitchBlocks.svg    # Interactive block overlay
  alex.jpeg              # Profile photo
  workshop.jpg           # Workshop reference
  [project assets]       # Per-project images
```

---

## Development

```bash
npm install
npm run dev        # localhost:3000
npm run build      # static export → out/
```

Add `.env.local` with Firebase config for the Firestore-backed features (golf request form, etc.).

## Deployment

```bash
firebase deploy --only hosting
```
