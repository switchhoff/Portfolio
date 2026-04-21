# Portfolio

Personal developer portfolio — an interactive, isometric workshop experience built with Next.js and Three.js. Point-and-click navigation through a 3D scene showcasing projects.

**Live:** [switchhoff.github.io/Portfolio](https://switchhoff.github.io/Portfolio) *(or Firebase Hosting)*

## Features

- Isometric 3D workshop scene (Three.js)
- Point-and-click navigation
- Project cards with live links and tags
- Firebase-backed projects data

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| 3D / Scene | Three.js |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Hosting | Firebase Hosting / static export |

## Development

```bash
npm install
npm run dev     # localhost:3000
npm run build   # static export to out/
```

## Deployment

```bash
firebase deploy --only hosting
```
