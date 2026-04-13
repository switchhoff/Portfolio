# Portfolio Setup Guide

## Firebase Configuration

1. **Connect Firebase Project**
   ```bash
   firebase init
   # Select: Hosting, Firestore (optional for live data)
   ```

2. **Environment Variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_FORMSPREE_ID=your_form_id
   GITHUB_TOKEN=your_github_token  # Optional: for higher API limits
   ```

## Project Metadata

### Option 1: Build-time fetch (default)
Projects are fetched from GitHub at build time via `scripts/fetch-projects.js`.

1. Add metadata to each repo's `main` branch:
   ```json
   // portfolio-meta.json
   {
     "tagline": "What this project does",
     "tags": ["Tag1", "Tag2"],
     "firebase": "project-id or null"
   }
   ```

2. Fetch and build:
   ```bash
   npm run fetch-projects  # Manual fetch
   npm run build           # Fetches + builds
   ```

### Option 2: Live Firestore data (future)
Store project metadata in Firestore instead of JSON files for real-time updates.

## Deploy

```bash
npm run deploy  # Builds (fetches projects) + deploys to Firebase Hosting
```

## GitHub Token

Get a token at https://github.com/settings/tokens/new with `repo` scope to avoid rate limits when fetching project metadata.
