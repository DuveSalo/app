---
name: verification-loop
description: Run 6-phase verification before PR creation
trigger: When user says /verify, /pre-pr, or "run verification"
---

# Verification Loop

Run all 6 phases sequentially. Stop on first FAIL and fix before continuing.

## Phase 1: Build
```bash
cd apps/web && pnpm build
```
Expected: Exit 0, no errors. Check for TypeScript errors in output.

## Phase 2: Type Check
```bash
cd apps/web && npx tsc --noEmit
```
Expected: Exit 0, zero errors.

## Phase 3: Format Check
```bash
cd apps/web && npx prettier --check "src/**/*.{ts,tsx}"
```
Expected: Exit 0. If files need formatting, run `pnpm format` and re-check.

## Phase 4: Unit Tests
```bash
pnpm test -- run
```
Expected: All tests pass. If failures, fix and re-run.

## Phase 5: Security Scan
- Check for `console.log` in non-test files
- Check for `as any` usage
- Check for hardcoded secrets/API keys
- Check for `process.env` usage (should use `@/lib/env`)
- Check for `.select('*')` in services (should use explicit columns)

## Phase 6: Diff Review
```bash
git diff main...HEAD --stat
git diff main...HEAD
```
Review changes for:
- Unintended file modifications
- Debug code left behind
- Missing test coverage for new functions
- File size violations (services >300 lines, hooks >150, pages >400)

## Output Format
Report each phase as PASS ✅ or FAIL ❌ with details.
