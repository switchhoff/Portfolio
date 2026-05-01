# Portfolio UI Features

## Top Navigation

### TL:DR Button
- Fixed position at top-right or top-left
- Jumps to `#tldr` section below hero image
- Provides quick summary for visitors in a hurry

#### TL:DR Section Content
- **Two-sentence summary** of Alex's background/skills
- **Resume link** (PDF download)
- **Quick links:**
  - GitHub
  - LinkedIn
  - Email
  - Instagram (photography)
  - YouTube (videography)

---

## Fun Tab — Canvas Sizing System

### Background image
- File: `/public/OffswitchBKGHIGH.png`
- Natural dimensions: **1164 × 1080 px** (ratio ≈ 1.078 : 1, nearly square)
- SVG overlay file: `/public/OffswitchBlocks.svg`, viewBox `0 0 960 540` (16 : 9)

### Desktop canvas (`app/page.tsx`)
The canvas fills the section exactly — edge to edge, top to bottom:

```
width:  100%               (= 100vw, fills viewport width)
height: 100%               (= calc(100vh − 60px), fills viewport height)
```

The parent `<section>` is `height: calc(100vh - 60px); overflow: hidden`, so the
canvas is hard-capped at the visible area — it cannot overflow vertically.
The image uses `objectFit: cover` and the SVG uses `preserveAspectRatio="xMidYMid slice"` —
both scale to fill the canvas ratio, cropping symmetrically as needed.

Using `min(100vw, (100vh−60px)×16/9)` for width left empty gaps on the sides of
wide screens (e.g. 1813px canvas in a 1920px viewport). `100%` fills edge-to-edge.

### Mobile canvas (`app/page.tsx`)
The canvas must fit between two fixed UI elements:
- **Above**: AmbientPlayer (≈ 36 px, `position: relative` in normal flow)
- **Below**: Cheats footbar (≈ 80 px, `position: fixed; bottom: 0`)
- Plus: 60 px header + 16 px top margin

Total vertical overhead ≈ **192 px**.

The container uses the image's natural aspect ratio so the full image is visible
with no cropping:

```
width        = min(100vw,  (100vh − 192px) × 1164/1080)
aspect-ratio = 1164 / 1080          ← height derives from width
image        = objectFit: fill      ← no distortion since container matches image ratio
```

The SVG overlay (`OffswitchBlocks.svg`) is rendered with
`preserveAspectRatio="xMidYMid slice"` and fills the full container (`inset: 0`).
The 16 : 9 SVG viewBox is wider than the 1.078 : 1 container, so the left/right
extremes of the SVG are cropped; all hotspots (designed for the centre of the
scene) remain accessible.

A **−1.35 % left offset** (`left: "-1.35%"`) is applied to both SVG layers on mobile only,
nudging the scene slightly left to better visually align the workshop content with
the background image. Desktop uses `left: 0`.

### Why not 16 : 9 on mobile?
A 16 : 9 container at `width: 100vw` on a 390 px portrait phone is only **219 px tall**
— too small. Using the image's 1164 : 1080 ratio gives **≈ 362 px** (65 % taller),
filling the available space between the two fixed UI elements.

---

## Cheat Guide (Bottom of Workshop Image)
- 5 tabbed categories: Projects, Experience, Interests, About, Contact
- Colored tabs matching hotspot regions
- Click tab → highlights all hotspots in that category
- Helps users discover content without point-and-click

**Categories:**
1. **Projects** (blue) — 17 items (apps, games, hobbies, camera, webcam)
2. **Experience** (red) — 7 items (education, work, rocketry, UAS, hackathon)
3. **Interests** (yellow) — 3 items (games, books, crafting)
4. **About** (dark green) — bio & background
5. **Contact** (green) — contact form

---

## Workshop Scene Interactions
- **29 hotspots** across workshop image
- Click on SVG elements to reveal modals/info
- Hotspot types:
  - **Projects**: App info cards
  - **Experience**: Education/work cards
  - **Popups**: Lists (games, books, crafting)
  - **Links**: External (Instagram, YouTube)
  - **Status**: Live data (3D printer MQTT)
  - **Form**: Contact submission
  - **About**: Bio

---

## Below Hero Section
### TL:DR (#tldr)
- Summary paragraph
- Resume download button
- Social/contact links

### Projects Showcase (Optional)
- Featured projects
- Or scrolls to cheat guide

### Contact Section
- Form (also accessible via envelope hotspot)
- Or redirects to formspree

### Footer
- Copyright
- Links
