#!/bin/bash
# Batch add portfolio-meta.json to all repos
# Usage: ./scripts/setup-repos.sh /path/to/repos/dir

REPOS_DIR=${1:-.}
TEMPLATE=".portfolio-meta-template.json"

if [ ! -f "$TEMPLATE" ]; then
  echo "Error: $TEMPLATE not found"
  exit 1
fi

for repo in $(find "$REPOS_DIR" -maxdepth 2 -name ".git" -type d | xargs dirname); do
  if [ -f "$repo/portfolio-meta.json" ]; then
    echo "⊘ $repo (already has portfolio-meta.json)"
    continue
  fi

  echo "→ $repo"
  cp "$TEMPLATE" "$repo/portfolio-meta.json"

  cd "$repo"
  git add portfolio-meta.json
  git commit -m "feat: add portfolio metadata" 2>/dev/null && echo "  ✓ committed"
  git push 2>/dev/null && echo "  ✓ pushed" || echo "  ⚠ push failed"
  cd - > /dev/null
done

echo "Done."
