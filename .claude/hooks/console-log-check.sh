#!/usr/bin/env bash
# PostToolUse[Write|Edit] — informational
# Warns about console.log in non-test TypeScript files

input=$(cat)

file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | sed 's/"file_path":"//;s/"$//')

# If no file_path found, try filePath
if [ -z "$file_path" ]; then
  file_path=$(echo "$input" | grep -o '"filePath":"[^"]*"' | sed 's/"filePath":"//;s/"$//')
fi

[ -z "$file_path" ] && exit 0

# Only check .ts/.tsx files, skip test/spec files
if ! echo "$file_path" | grep -qE '\.(ts|tsx)$'; then
  exit 0
fi
if echo "$file_path" | grep -qE '\.(test|spec)\.(ts|tsx)$'; then
  exit 0
fi

[ ! -f "$file_path" ] && exit 0

matches=$(grep -n "console\.log" "$file_path" 2>/dev/null)
if [ -n "$matches" ]; then
  echo "⚠️  console.log found in $(basename "$file_path"):"
  while IFS= read -r line; do
    echo "  $line"
  done <<< "$matches"
  echo "  Consider removing before commit."
fi

exit 0
