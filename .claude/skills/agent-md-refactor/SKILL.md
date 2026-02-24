---
name: agent-md-refactor
description: Refactor bloated agent instruction systems — from single files (AGENTS.md, CLAUDE.md) to entire project configurations — into organized, progressive-disclosure structures. Handles monolithic files, scattered instructions across directories, duplicate/conflicting rules between subfolders, and missing documentation. Optimized for React 19 + TypeScript + Vite + Supabase + Tailwind stacks with feature-based architecture. Use this skill whenever the user mentions refactoring agent instructions, organizing CLAUDE.md files, cleaning up project-wide agent config, consolidating scattered .claude/ folders, auditing agent instructions across a monorepo, or says their agent setup is "a mess". Also trigger when the user wants to create an agent instruction system from scratch for an existing project.
license: MIT
---

# Agent MD Refactor

Refactor agent instruction systems — from a single bloated file to an entire project's configuration — following **progressive disclosure principles**. Keeps essentials at root, organizes the rest into linked categorized files, and ensures consistency across the whole project tree.

## Target Stack Profile

This skill is optimized for projects using the following stack. Adapt categories and examples when the project differs.

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.8, Vite 6.2 |
| UI | Tailwind CSS (custom design system `gray-*`), shadcn/ui |
| Routing | HashRouter (React Router) with lazy loading |
| Backend | Supabase (PostgreSQL, Auth with Google OAuth, Storage, Edge Functions on Deno/TS) |
| Payments | PayPal |
| Testing | Vitest + jsdom, React Testing Library |
| Formatting | Prettier |
| Package manager | npm |
| Path aliases | `@/*` → `src/*` |
| Architecture | Feature-based (`src/features/`), common components (`src/components/common/`), API services (`src/lib/api/services/`), centralized types (`src/types/` with Supabase auto-generated types) |

---

## Scope Detection

Before starting, determine what you're working with:

| Signal | Scope | Action |
|--------|-------|--------|
| User points to a single file | **File-level** | Refactor that file (Phase A) |
| User says "refactor my project" / "clean up my agent setup" | **Project-level** | Audit entire tree (Phase B) |
| Monorepo with multiple packages/services | **Monorepo-level** | Full hierarchy audit (Phase C) |
| User wants to create instructions from scratch | **Bootstrap** | Analyze codebase, generate structure (Phase D) |

Ask the user to confirm scope if ambiguous. Then proceed to the matching phase.

---

## Phase A: Single File Refactor

Use this when the target is one file (CLAUDE.md, AGENTS.md, COPILOT.md, etc.).

### A1. Find Contradictions

Scan the file for conflicting instructions.

**Look for:**
- Contradictory style guidelines (e.g., "use semicolons" vs "no semicolons")
- Conflicting workflow instructions
- Incompatible tool preferences
- Mutually exclusive patterns

**For each contradiction:**
```
Contradiction Found
  Instruction A: [quote]
  Instruction B: [quote]
  Question: Which takes precedence, or should both be conditional?
```

Ask user to resolve before proceeding.

### A2. Identify Essentials

Extract ONLY what belongs in the root file — information that applies to **every single task**.

**Keep in root:**
| Category | Example |
|----------|---------|
| Project description | One sentence: "A React dashboard for analytics" |
| Package manager | Only if not npm (e.g., "Uses pnpm") — npm is the default, no need to state it |
| Non-standard commands | Custom build/test/typecheck commands |
| Critical overrides | Things that MUST override defaults |
| Universal rules | Applies to 100% of tasks |

**Move to linked files:**
- Language-specific conventions
- Testing guidelines
- Code style details
- Framework patterns
- Documentation standards
- Git workflow details

### A3. Group the Rest

Organize remaining instructions into logical categories.

**Common categories for this stack:**
| File | Contents |
|------|----------|
| `typescript.md` | TS 5.8 conventions, type patterns, path aliases (`@/*`), Supabase auto-generated types usage |
| `react-patterns.md` | React 19 conventions, component structure, hooks rules, lazy loading, HashRouter patterns |
| `ui-components.md` | shadcn/ui usage, Tailwind design system (`gray-*`), common components (`src/components/common/`) |
| `supabase.md` | Auth (Google OAuth), Storage, DB queries, RLS policies, Edge Functions (Deno/TS) conventions |
| `testing.md` | Vitest + jsdom setup, React Testing Library patterns, mocking Supabase |
| `architecture.md` | Feature-based structure (`src/features/`), API services layer (`src/lib/api/services/`), data flow |
| `code-style.md` | Prettier config, naming conventions, import ordering, file organization |

**Adapt categories when the project differs** — these are defaults for the target stack. A project without Supabase wouldn't need `supabase.md`; a monorepo might split `react-patterns.md` per app.

**Grouping rules:**
1. Each file must be self-contained for its topic
2. Aim for 3-8 files (not too granular, not too broad)
3. Name files clearly: `{topic}.md`
4. Include only actionable instructions

### A4. Create File Structure

```
project-root/
├── CLAUDE.md                     # Minimal root with links
└── .claude/
    ├── typescript.md
    ├── testing.md
    ├── code-style.md
    └── ...
```

**Root file template:**
```markdown
# Project Name

One-sentence project description.

## Commands
- `npm run dev` — Start Vite dev server
- `npm test` — Run Vitest
- `npm run build` — Production build

## Stack
React 19 + TypeScript 5.8 + Vite 6.2 + Supabase + Tailwind/shadcn

## Guidelines
- [TypeScript](.claude/typescript.md)
- [React Patterns](.claude/react-patterns.md)
- [UI Components](.claude/ui-components.md)
- [Supabase](.claude/supabase.md)
- [Testing](.claude/testing.md)
- [Architecture](.claude/architecture.md)
```

**Linked file template:**
```markdown
# {Topic} Guidelines

## Overview
Brief context for when these guidelines apply.

## Rules

### Rule Category 1
- Specific, actionable instruction
- Another specific instruction

## Examples

### Good
\`\`\`typescript
// Feature component with lazy loading
const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'));

// Supabase query in service layer
export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, active')
    .eq('active', true);
  if (error) throw error;
  return data;
}
\`\`\`

### Avoid
\`\`\`typescript
// Don't query Supabase directly in components
function CompanyList() {
  useEffect(() => {
    supabase.from('companies').select('*').then(/* ... */);
  }, []);
}

// Don't use relative paths when alias exists
import { Button } from '../../../components/common/Button';
// Use: import { Button } from '@/components/common/Button';
\`\`\`
```

### A5. Flag for Deletion

Remove instructions that waste context:

| Criterion | Example | Why Delete |
|-----------|---------|------------|
| Redundant | "Use TypeScript" (in a .ts project) | Agent already knows |
| Redundant | "Use Tailwind for styling" (tailwind.config present) | Obvious from config |
| Too vague | "Write clean code" | Not actionable |
| Overly obvious | "Don't introduce bugs" | Wastes context |
| Default behavior | "Use descriptive variable names" | Standard practice |
| Inferable | "Import from @/* alias" (tsconfig paths set) | Agent reads tsconfig |
| Outdated | References deprecated Supabase JS v1 APIs | No longer applies |

---

## Phase B: Project-Level Refactor

Use when the user wants to clean up agent instructions across an entire project.

### B1. Discovery — Map the Current State

Scan the project tree for all agent instruction files:

```bash
# Find all agent instruction files
find . -maxdepth 6 -type f \( \
  -iname "CLAUDE.md" -o \
  -iname "AGENTS.md" -o \
  -iname "COPILOT.md" -o \
  -iname ".cursorrules" -o \
  -iname ".github/copilot-instructions.md" -o \
  -iname "*.mdc" \
\) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null

# Also check for existing .claude/ directories
find . -maxdepth 4 -type d -name ".claude" ! -path "*/node_modules/*" 2>/dev/null

# Check for instructions embedded in config files
grep -rl "agent\|claude\|copilot" . --include="*.json" --include="*.yaml" --include="*.yml" \
  -l 2>/dev/null | head -20
```

**Produce an inventory:**
```
Agent Instruction Inventory
  Files found: N
  Locations:
    ./CLAUDE.md (root) — 340 lines
    ./packages/api/CLAUDE.md — 85 lines
    ./packages/web/.claude/code-style.md — 42 lines
    ./.cursorrules — 120 lines
    ./.github/copilot-instructions.md — 60 lines
  Issues detected:
    - Potential duplicates: [list]
    - Multiple agent systems: [list]
    - Orphaned files: [list]
```

### B2. Cross-File Analysis

Read ALL discovered files and analyze relationships:

**Build a conflict matrix:**

| Instruction | File A | File B | Status |
|-------------|--------|--------|--------|
| Supabase queries | root: "use service layer" | feature/auth: "direct supabase calls" | CONFLICT |
| Component imports | root: "use @/ alias" | .cursorrules: "relative imports" | CONFLICT |
| State management | root: "React state only" | feature/dashboard: "uses Zustand" | CONDITIONAL |

**Classify each conflict as:**
- **True conflict** — same scope, contradictory rules → ask user to resolve
- **Conditional** — different scopes, both valid → document the condition
- **Override** — child intentionally overrides parent → make explicit
- **Stale** — one is outdated → flag for deletion

**Identify duplication:**

| Instruction | Appears In | Action |
|-------------|-----------|--------|
| "Use Prettier" | root, feature/auth, feature/dashboard | Keep in root only |
| "Supabase RLS required" | root, supabase.md | Keep in .claude/supabase.md only |
| "Lazy load routes" | root, architecture.md | Keep in .claude/react-patterns.md |

### B3. Design the Target Hierarchy

Define the new structure based on project shape:

**Standard project:**
```
project/
├── CLAUDE.md                    # Root: project overview + commands + links
└── .claude/
    ├── code-style.md
    ├── testing.md
    ├── architecture.md
    └── ...
```

**Project with distinct sub-areas:**
```
project/
├── CLAUDE.md                    # Root: universal rules + links
├── .claude/
│   ├── shared-conventions.md    # Applies everywhere
│   └── deployment.md
├── frontend/
│   └── CLAUDE.md                # Frontend-specific (inherits root)
├── backend/
│   └── CLAUDE.md                # Backend-specific (inherits root)
└── infrastructure/
    └── CLAUDE.md                # Infra-specific (inherits root)
```

**Inheritance rules:**
1. Child `CLAUDE.md` inherits all parent rules automatically
2. Child should ONLY contain what differs from or extends the parent
3. Child can explicitly override parent rules — but must state "Override: ..."
4. Never duplicate parent instructions in child files

### B4. Multi-Agent Consolidation

If the project has instructions for multiple agents (Claude, Copilot, Cursor):

**Option 1 — Unified (recommended if rules are 80%+ similar):**
Keep one canonical system (e.g., `CLAUDE.md` + `.claude/`). Generate thin adapter files for other agents:

```markdown
# .cursorrules
# Auto-generated from CLAUDE.md — do not edit directly.
# Source of truth: CLAUDE.md + .claude/
[extracted subset relevant to Cursor]
```

**Option 2 — Parallel (if agents need very different instructions):**
```
project/
├── CLAUDE.md
├── .claude/
│   └── ...
├── .cursorrules
└── .github/
    └── copilot-instructions.md
```

Document the relationship between files so updates stay in sync.

### B5. Execute the Refactor

For each file in the inventory:
1. Apply Phase A (single-file refactor) process
2. Resolve cross-file conflicts from B2
3. Place content in the target hierarchy from B3
4. Remove emptied/consolidated files
5. Update any cross-references or links

**Produce a migration log:**
```
Migration Log
  Moved: 12 instruction blocks
  Consolidated: 5 duplicates
  Deleted: 8 vague/redundant instructions
  Conflicts resolved: 3
  New files created: 4
  Files removed: 2
```

### B6. Validation

After refactoring, verify the project-level result:

```
[ ] All original instruction files accounted for (migrated or intentionally deleted)
[ ] No contradictions between root and child files
[ ] No duplicated instructions across files
[ ] Each child CLAUDE.md only contains what differs from parent
[ ] All links between files resolve correctly
[ ] Root file under 50 lines
[ ] Each linked file is self-contained
[ ] Multi-agent files (if any) are marked with source of truth
```

---

## Phase C: Monorepo-Level Refactor

For monorepos with multiple packages, services, or apps.

### C1. Map the Monorepo

```bash
# Identify package boundaries
find . -maxdepth 3 -name "package.json" -o -name "Cargo.toml" -o -name "go.mod" \
  -o -name "pyproject.toml" | sort

# Map existing agent instructions per package
for pkg in $(find . -maxdepth 3 -name "package.json" -exec dirname {} \;); do
  echo "=== $pkg ==="
  find "$pkg" -maxdepth 2 \( -iname "CLAUDE.md" -o -iname "AGENTS.md" -o -name ".claude" \) 2>/dev/null
done
```

**Produce a package map:**
```
Monorepo Package Map
  Root: monorepo/
  Packages:
    packages/shared-ui    — has CLAUDE.md (45 lines)
    packages/api-server    — has CLAUDE.md (200 lines) + .claude/ (3 files)
    packages/auth-service  — no agent instructions
    packages/mobile-app    — has CLAUDE.md (30 lines)
    apps/web-dashboard     — has .cursorrules only
    apps/admin-panel       — no agent instructions
  
  Coverage: 4/6 packages have instructions
  Missing: auth-service, admin-panel
```

### C2. Define Inheritance Strategy

**Three-tier model for monorepos:**

```
monorepo/
├── CLAUDE.md                         # Tier 1: Universal (all packages)
├── .claude/
│   ├── typescript.md                 # Shared conventions
│   ├── testing.md
│   └── git-workflow.md
├── packages/
│   ├── shared-ui/
│   │   └── CLAUDE.md                 # Tier 2: Package-specific
│   ├── api-server/
│   │   ├── CLAUDE.md                 # Tier 2: Package-specific
│   │   └── .claude/
│   │       └── api-conventions.md    # Tier 3: Deep detail
│   └── auth-service/
│       └── CLAUDE.md                 # Tier 2: (generated from analysis)
└── apps/
    └── web-dashboard/
        └── CLAUDE.md                 # Tier 2: App-specific
```

**Tier rules:**
| Tier | Scope | Content | Max Lines |
|------|-------|---------|-----------|
| 1 — Root | All packages | Monorepo tooling, universal rules, shared commands | 50 |
| 2 — Package | One package | Tech stack, domain context, package-specific commands | 80 |
| 3 — Detail | One topic within a package | Deep conventions for complex areas | 150 |

**Content flows DOWN, never UP:**
- Root instructions apply everywhere automatically
- Package instructions extend (never repeat) root
- Detail files are linked from package CLAUDE.md

### C3. Identify Shared vs. Local Instructions

Analyze all instructions across packages:

| Instruction | Packages | Action |
|-------------|----------|--------|
| "Use pnpm" | all | Move to root |
| "Strict TypeScript" | all TS packages | Move to root .claude/typescript.md |
| "REST API uses snake_case" | api-server only | Keep in api-server/CLAUDE.md |
| "React component naming" | shared-ui, web-dashboard | Move to root .claude/react.md, link from both |
| "Mobile-specific accessibility" | mobile-app only | Keep in mobile-app/CLAUDE.md |

**Rule: If 60%+ of packages share an instruction, elevate to root.**

### C4. Generate Missing Instructions

For packages without agent instructions, analyze the codebase to generate a starter:

```bash
# Analyze package to infer conventions
ls $PKG_PATH/src/          # File structure
head -20 $PKG_PATH/src/**  # Code patterns
cat $PKG_PATH/package.json # Dependencies and scripts
cat $PKG_PATH/tsconfig.json # TypeScript config
```

Generate a minimal CLAUDE.md based on:
- Package name and purpose (from package.json description)
- Available scripts (build, test, lint)
- Key dependencies that imply conventions
- File structure patterns observed

Mark generated files clearly:
```markdown
# Package Name

<!-- Generated by agent-md-refactor. Review and customize. -->

One-sentence description from package.json.

## Commands
- `pnpm test` — Run tests
- `pnpm build` — Build package
```

### C5. Execute and Validate

Apply the refactor across all packages, then validate:

```
Monorepo Validation
  [ ] Root CLAUDE.md covers all universal rules
  [ ] Every package has a CLAUDE.md (even if minimal)
  [ ] No instruction duplicated between root and package
  [ ] Shared conventions are in root .claude/ with links
  [ ] Package files only contain package-specific content
  [ ] All cross-references resolve
  [ ] Generated files are marked for review
```

---

## Phase D: Bootstrap from Scratch

When the user has a project with NO agent instructions and wants to create them.

### D1. Analyze the Codebase

```bash
# Project structure
find . -maxdepth 3 -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/dist/*" | head -50

# Config files that reveal conventions
cat package.json 2>/dev/null
cat tsconfig.json 2>/dev/null
cat vite.config.* 2>/dev/null
cat tailwind.config.* 2>/dev/null
cat .prettierrc* 2>/dev/null
cat vitest.config.* 2>/dev/null

# Supabase setup
ls supabase/ 2>/dev/null
cat supabase/config.toml 2>/dev/null
find . -path "*/supabase/functions/*" -name "index.ts" 2>/dev/null

# Feature structure
ls src/features/ 2>/dev/null
ls src/components/common/ 2>/dev/null
ls src/lib/api/services/ 2>/dev/null
ls src/types/ 2>/dev/null

# Existing documentation
cat README.md 2>/dev/null
cat CONTRIBUTING.md 2>/dev/null

# Git patterns
git log --oneline -20 2>/dev/null
```

### D2. Infer Conventions

From the analysis, extract conventions mapped to the target stack:

| Category | Source | Inferred Convention |
|----------|--------|-------------------|
| Language | tsconfig.json, file extensions | TypeScript 5.8 strict mode |
| Framework | package.json deps | React 19 + Vite 6.2 |
| Routing | source code analysis | HashRouter with lazy loading |
| UI | tailwind.config, component imports | Tailwind + shadcn/ui, `gray-*` design tokens |
| Backend | supabase/ directory | Supabase (Auth, Storage, Edge Functions) |
| Testing | vitest.config | Vitest + jsdom + React Testing Library |
| Formatting | .prettierrc | Prettier (check specific rules) |
| Architecture | src/ structure | Feature-based with service layer |
| Path aliases | tsconfig paths | `@/*` → `src/*` |
| Payments | package.json deps, source | PayPal integration |

### D3. Draft Instructions

Generate the full instruction set, then apply Phase A to structure it:

1. Write a flat draft of all discovered conventions
2. Separate essentials from details (A2)
3. Group into categories (A3)
4. Create file structure (A4)
5. Remove anything the agent would already know (A5)

**Present to user for review before writing files.**

### D4. Write Files

Only after user approval, create the files in the project.

---

## Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Keeping everything in root | Bloated, wastes context | Split into linked files |
| Duplicating parent rules in children | Drift, inconsistency | Inherit; only add differences |
| Too many categories | Fragmentation, hard to navigate | Consolidate related topics (3-8 files) |
| Vague instructions | Wastes tokens, no value | Be specific or delete |
| Duplicating tool defaults | Agent already knows | Only override when needed |
| Deep nesting (.claude/.rules/.style/) | Hard to navigate | Flat structure with links |
| Scatter across agent systems | Impossible to maintain | Single source of truth |
| No instructions for some packages | Inconsistent behavior | Generate starters for coverage |

---

## Execution Checklist (All Scopes)

```
Scope Detection
  [ ] Confirmed scope with user (file / project / monorepo / bootstrap)

Analysis
  [ ] All instruction files discovered and inventoried
  [ ] All contradictions identified and resolved with user
  [ ] Duplications mapped and consolidation plan approved
  [ ] Multi-agent overlap assessed (if applicable)

Structure
  [ ] Target hierarchy designed and approved by user
  [ ] Root file contains ONLY essentials (under 50 lines)
  [ ] Child files only contain what differs from parent
  [ ] All linked files are self-contained

Cleanup
  [ ] Redundant/vague instructions flagged and removed
  [ ] Orphaned files cleaned up
  [ ] Generated files marked for review

Validation
  [ ] All links resolve correctly
  [ ] No contradictions between files
  [ ] No duplicated instructions across files
  [ ] Coverage: every significant area has instructions
  [ ] Migration log produced
```