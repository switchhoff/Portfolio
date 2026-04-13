#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const reposDir = process.argv[2] || '.';
const template = require('../.portfolio-meta-template.json');

function setupRepo(repoPath) {
  const metaPath = path.join(repoPath, 'portfolio-meta.json');

  if (fs.existsSync(metaPath)) {
    console.log(`⊘ ${repoPath} (already exists)`);
    return;
  }

  try {
    fs.writeFileSync(metaPath, JSON.stringify(template, null, 2));
    console.log(`→ ${repoPath}`);

    const cwd = repoPath;
    try {
      execSync('git add portfolio-meta.json', { cwd, stdio: 'pipe' });
      execSync('git commit -m "feat: add portfolio metadata"', { cwd, stdio: 'pipe' });
      console.log('  ✓ committed');

      execSync('git push', { cwd, stdio: 'pipe' });
      console.log('  ✓ pushed');
    } catch (e) {
      console.log('  ⚠ git operation failed (may need manual push)');
    }
  } catch (e) {
    console.error(`  ✗ ${e.message}`);
  }
}

// Find all repos
const entries = fs.readdirSync(reposDir);
entries.forEach(entry => {
  const full = path.join(reposDir, entry);
  if (fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, '.git'))) {
    setupRepo(full);
  }
});

console.log('Done.');
