#!/usr/bin/env bash
# PostToolUse[Write|Edit] — informational
# Runs TypeScript type checking on changed files

input=$(cat)

file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | sed 's/"file_path":"//;s/"$//')

if [ -z "$file_path" ]; then
  file_path=$(echo "$input" | grep -o '"filePath":"[^"]*"' | sed 's/"filePath":"//;s/"$//')
fi

[ -z "$file_path" ] && exit 0

# Only check .ts/.tsx files under apps/web/src
if ! echo "$file_path" | grep -qE '\.(ts|tsx)$'; then
  exit 0
fi
if ! echo "$file_path" | grep -q "apps/web/src"; then
  exit 0
fi

web_dir="$(git rev-parse --show-toplevel 2>/dev/null)/apps/web"
if [ ! -d "$web_dir" ]; then
  exit 0
fi

output=$(cd "$web_dir" && npx tsc --noEmit 2>&1)
tsc_exit=$?

if [ $tsc_exit -ne 0 ]; then
  echo "⚠️  TypeScript errors detected:"
  echo "$output" | head -30
  if [ "$(echo "$output" | wc -l)" -gt 30 ]; then
    echo "  ... (truncated, run 'npx tsc --noEmit' for full output)"
  fi
fi

exit 0
