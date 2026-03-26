#!/usr/bin/env bash
# PostToolUse[Write|Edit] — async
# Runs Prettier on supported files

input=$(cat)

file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | sed 's/"file_path":"//;s/"$//')

if [ -z "$file_path" ]; then
  file_path=$(echo "$input" | grep -o '"filePath":"[^"]*"' | sed 's/"filePath":"//;s/"$//')
fi

[ -z "$file_path" ] && exit 0

# Only format supported file types
if ! echo "$file_path" | grep -qE '\.(ts|tsx|js|jsx|css)$'; then
  exit 0
fi

[ ! -f "$file_path" ] && exit 0

# Run prettier from apps/web directory
web_dir="$(git rev-parse --show-toplevel 2>/dev/null)/apps/web"
if [ -d "$web_dir" ]; then
  cd "$web_dir" && npx prettier --write "$file_path" > /dev/null 2>&1
fi

exit 0
