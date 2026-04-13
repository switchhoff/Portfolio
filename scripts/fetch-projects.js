const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PROJECTS_FILE = path.join(__dirname, '../projects.json');

async function fetchGitHubRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` }),
  };

  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.warn(`⚠ Failed to fetch ${owner}/${repo}: ${res.status}`);
    return null;
  }

  const data = await res.json();
  return {
    stars: data.stargazers_count,
    updated: data.updated_at,
    description: data.description,
    language: data.language,
  };
}

async function fetchPortfolioMeta(owner, repo) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/portfolio-meta.json`;
  const headers = GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {};

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function main() {
  const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));

  console.log('Fetching GitHub metadata for projects...');

  for (const proj of projects) {
    const [owner, repo] = proj.repo.split('/');

    // Fetch GitHub data
    const ghData = await fetchGitHubRepo(owner, repo);
    if (ghData) {
      proj.stars = ghData.stars;
      proj.updated = ghData.updated;
      if (!proj.tagline || proj.tagline.startsWith('TODO')) {
        proj.tagline = ghData.description || proj.tagline;
      }
      if (!proj.language && ghData.language) {
        if (!proj.tags.includes(ghData.language)) {
          proj.tags.push(ghData.language);
        }
      }
    }

    // Fetch portfolio-meta.json if exists
    const meta = await fetchPortfolioMeta(owner, repo);
    if (meta) {
      if (meta.tagline) proj.tagline = meta.tagline;
      if (meta.tags) proj.tags = meta.tags;
      if (meta.firebase) proj.firebase = meta.firebase;
    }

    console.log(`✓ ${proj.name}`);
  }

  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  console.log('\nProjects updated.');
}

main().catch(console.error);
