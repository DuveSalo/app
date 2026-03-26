#!/usr/bin/env bash
# PreToolUse[Bash] — informational
# Shows pre-push checklist before git push

input=$(cat)

command=$(echo "$input" | grep -o '"command":"[^"]*"' | sed 's/"command":"//;s/"$//')

[ -z "$command" ] && exit 0

if echo "$command" | grep -q "git push"; then
  echo "⚠️  Pre-push checklist:"
  echo "  □ Build passes (pnpm build)"
  echo "  □ Tests pass (pnpm test -- run)"
  echo "  □ No console.log left"
  echo "  □ Types check (npx tsc --noEmit)"
fi

exit 0
