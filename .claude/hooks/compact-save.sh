#!/usr/bin/env bash
# PreCompact — informational
# Prints git state snapshot before context compaction

input=$(cat 2>/dev/null) || true

echo "📸 Git state snapshot before compaction:"
echo ""

# Current branch
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
echo "  Branch: ${branch:-unknown}"

# Last 3 commits
echo "  Recent commits:"
git log --oneline -3 2>/dev/null | while IFS= read -r line; do
  echo "    $line"
done

# Modified files count
modified=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
echo "  Modified files: $modified"

# Staged files count
staged=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
echo "  Staged files: $staged"

exit 0
