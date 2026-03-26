#!/usr/bin/env bash
# PreToolUse[Bash] — BLOCKING
# Scans staged files for secrets before git commit

input=$(cat)

command=$(echo "$input" | grep -o '"command":"[^"]*"' | sed 's/"command":"//;s/"$//')

# Only run on git commit commands
if ! echo "$command" | grep -q "git commit"; then
  exit 0
fi

# Get staged files
staged_files=$(git diff --cached --name-only 2>/dev/null)
if [ -z "$staged_files" ]; then
  exit 0
fi

found=0

while IFS= read -r file; do
  [ -z "$file" ] && continue
  [ ! -f "$file" ] && continue

  # Skip hook scripts, skill docs, and supabase edge functions (legitimate server-side usage)
  case "$file" in
    .claude/hooks/*|.claude/skills/*|supabase/functions/*) continue ;;
  esac

  # Grep for secret patterns
  matches=$(grep -nE "(SUPABASE_SERVICE_ROLE|sk_live_|pk_live_|sk_test_|-----BEGIN.*PRIVATE KEY|PASSWORD=|TOKEN=|SECRET=)" "$file" 2>/dev/null)
  if [ -n "$matches" ]; then
    if [ "$found" -eq 0 ]; then
      echo "🚨 SECRET DETECTED — commit blocked!"
      echo ""
    fi
    found=1
    echo "  File: $file"
    while IFS= read -r line; do
      echo "    $line"
    done <<< "$matches"
    echo ""
  fi
done <<< "$staged_files"

if [ "$found" -eq 1 ]; then
  echo "Remove secrets before committing."
  exit 2
fi

exit 0
