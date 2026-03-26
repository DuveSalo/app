# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Escuela Segura** — Safety compliance management SaaS for Argentine schools. Tracks fire extinguishers, conservation certificates, self-protection systems, QR documents, and event information with expiration monitoring and notification workflows.

## Tech Stack

- **Framework**: Next.js 16 (App Router for landing/SEO) + React Router SPA (for `/app/*` dashboard)
- **React 19**, **TypeScript 5.8** (strict mode), **Tailwind CSS v4** (PostCSS, no v3 config file)
- **UI**: shadcn/ui (neutral theme, new-york style) + custom composed components
- **Data fetching**: TanStack Query v5 (staleTime 2min, gcTime 10min, no refetch on focus)
- **Tables**: @tanstack/react-table v8
- **Forms**: react-hook-form v7 + Zod v4 + shadcn Form/FormField
- **Backend**: Supabase (PostgreSQL + Auth with PKCE + Edge Functions in Deno + Realtime)
- **Payments**: MercadoPago subscriptions via Edge Functions
- **Package manager**: pnpm monorepo (`apps/web/` + `packages/` + `supabase/`)

## Commands

```bash
# Development (from root)
pnpm install              # Install all dependencies
pnpm dev                  # Start Next.js dev server (port 3000)
pnpm build                # Production build (~6s with Turbopack)

# Unit tests (Vitest 4 + React Testing Library)
pnpm test                 # Watch mode
pnpm test -- run          # Single run
pnpm test -- run src/lib/utils/dateUtils.test.ts   # Single file

# E2E tests (Playwright — config at repo root, testDir: ./e2e)
cd apps/web
pnpm test:e2e             # Headless Chromium
pnpm test:e2e:ui          # Playwright UI mode

# Formatting
cd apps/web && pnpm format  # Prettier (single quotes, trailing commas, 100 char width, 2-space indent)

# Supabase
npx supabase start                      # Local Supabase
npx supabase functions serve             # Serve Edge Functions locally
npx supabase functions deploy <name>     # Deploy single function
npx supabase db push                     # Push migrations
```

## Architecture

### Dual Routing System

1. **Next.js App Router** (`src/app/`): Landing page (`/`), legal pages (`/privacidad`, `/terminos`), SEO (sitemap, robots)
2. **React Router SPA** (`src/App.tsx`): Dashboard at `/app/*`, mounted via catch-all `src/app/app/[[...slug]]/client.tsx` with `BrowserRouter` (basename `/app`)

All SPA page components are lazy-loaded via `src/routes/routes.config.ts`.

### ProtectedRoute Guard (3-level)

1. No user → redirect to `/login`
2. No company → redirect to `/create-company`
3. No subscription → redirect to `/subscribe` (allows `/settings` through)
4. Fully onboarded user on auth routes → redirect to `/dashboard`

### Feature Module Pattern

Each domain lives in `src/features/{name}/` with:
- `{Name}ListPage.tsx` — list with filters, sorting, pagination
- `CreateEdit{Name}Page.tsx` — form with sections
- `components/` — feature-specific UI
- `schemas.ts` — Zod schemas + inferred types

11 modules: admin, auth, conservation-certificates, dashboard, event-information, fire-extinguishers, notifications, placeholders, qr, self-protection-systems, settings.

Canonical example: `src/features/fire-extinguishers/`

### Data Fetching (TanStack Query)

- **Query keys**: typed factory in `src/lib/queryKeys.ts` — always use these, never inline key arrays
- **Query client**: configured in `src/lib/queryClient.ts` (2min stale, 10min gc, 1 retry, no refocus)
- **Supabase Realtime**: used in NotificationBell (30s fallback), BankTransferStatusPage (60s fallback), BillingSection (60s fallback). Polling reserved for Realtime fallbacks only.

### API Layer (`src/lib/api/services/`)

One service file per entity. Admin services split into `admin/` subdirectory with barrel index.ts. Conventions:
- Prefer explicit `.select('id, name')` over `.select('*')`
- Use relational queries for N+1 prevention
- `mapXFromDb` functions (in `mappers.ts`) convert snake_case DB → camelCase domain types
- Error handling via `handleSupabaseError()` + custom error classes in `lib/utils/errors.ts`
- Environment variables: always import from `@/lib/env` (Zod-validated), never `process.env` directly

### Component Hierarchy

| Layer | Location | Rule |
|---|---|---|
| shadcn primitives | `components/ui/` | **Do NOT modify** — managed by shadcn CLI |
| Composed components | `components/common/` | Project-specific: DataTable, Table, TableToolbar, Pagination, SkeletonLoader, Modal, ConfirmDialog, StatusBadge, DatePicker, FileUpload, TrialBanner |
| Layout | `components/layout/` | MainLayout, Sidebar, PageLayout, AuthLayout |
| Landing | `components/landing/` | Landing page sections, import from `components/ui/` |
| Feature UI | `features/*/components/` | Module-specific components |

If shadcn has the component, use it from `ui/`. Never duplicate in `common/`.

### Supabase Edge Functions (`supabase/functions/`)

- Shared utilities in `_shared/` (CORS, admin client, MercadoPago auth, Resend email, logger, status-maps)
- Every function must validate JWT from Authorization header before business logic
- `service_role` key is only used in Edge Functions, never in client code
- Webhook handlers must verify signatures and be idempotent
- MercadoPago retry: `mpFetch()` retries 3x with exponential backoff

## Design System Rules

- **Colors**: Always use semantic tokens. Never hardcode Tailwind colors. Only exception: status badges (emerald/amber/red)
- **Border radius**: `rounded-lg` (10px) on everything
- **Typography**: Inter (sans + headings), JetBrains Mono (mono). Scale: text-2xl (page title), text-base (section title), text-sm (body), text-xs (small)
- **Buttons**: 3 variants only — default, destructive, ghost. 2 sizes — default, icon
- **Icons**: Lucide exclusively
- **Shadows**: No shadows on cards (border only). shadow-md (dropdowns), shadow-lg (modals)
- **Toasts**: Sonner — `toast.success()` for actions, `toast.error()` for errors, `toast.info()` for neutral
- **AlertDialog**: Always destructive (red button) for delete, logout, cancel subscription
- **Tables**: DataTable with @tanstack/react-table. Filters from column headers. No row click navigation. Pagination always visible.
- **Forms**: No Card wrapper. Sections separated by border-t. react-hook-form + zod + shadcn Form/FormField
- **Loading**: Skeleton loading (SkeletonTable/SkeletonCards/SkeletonForm) for all pages. No page-level spinners.
- **Settings**: Accessed from user DropdownMenu in sidebar footer, NOT from sidebar nav

## Type Safety & Code Health Rules

### Type Safety
- **NEVER use `as any`** — if database.types.ts doesn't have a table, regenerate first: `npx supabase gen types typescript --project-id <id> > apps/web/src/types/database.types.ts`
- **NEVER use `Record<string, unknown>` for DB rows** — always use `Tables<'table_name'>`
- After ANY migration (`supabase db push`), immediately regenerate types

### Zod v4 Specifics
- Use `error` not `required_error` in validation messages
- Use `.or(z.literal(""))` for optional strings
- Schemas live in `features/{name}/schemas.ts` (one per module)

### File Size Limits
- API service files: max 300 lines. If larger, split into directory with barrel index.ts
- Custom hooks: max 150 lines. If larger, split by responsibility
- Page components: max 400 lines. Extract sections into feature components

### Conventions
- Toast: always `import { toast } from 'sonner'` directly. Never create wrapper contexts
- Destructive actions: always AlertDialog or ConfirmDialog. Never `window.confirm()` or `window.alert()`
- Company ID: services resolve companyId via auth internally. Never pass mock or hardcoded IDs from pages
- Multi-step forms: use `trigger([...TAB_FIELDS[tab]])` for per-tab validation

## Testing

### Unit Tests (Vitest 4)
- Config: `apps/web/vitest.config.ts` — jsdom environment, globals enabled
- Setup: `src/test/setup.ts` — mocks matchMedia, IntersectionObserver, ResizeObserver, Supabase client
- Factories: `src/test/factories.ts` — `createMockUser()`, `createMockCompany()`, `createMockSubscription()`, `createMockFireExtinguisher()`, `createMockPaymentTransaction()`
- Helpers: `src/test/renderHelpers.tsx` — `renderWithRouter()`, `renderWithAuth()` (wraps with mocked AuthContext + MemoryRouter)
- Pattern: test file must mock `@/lib/auth/AuthContext` before importing when using `renderWithAuth()`

### E2E Tests (Playwright)
- Config: `playwright.config.ts` at repo root, `testDir: './e2e'`
- Chromium only, retries 2 in CI / 0 local, traces on first retry
- Base URL: `http://localhost:3000`

## Key File Locations

- Auth context: `src/lib/auth/AuthContext.tsx`
- Route paths: `src/constants/routes.ts` (ROUTE_PATHS)
- Module metadata: `src/constants/modules.ts` (MODULE_TITLES)
- Query keys: `src/lib/queryKeys.ts`
- Query client: `src/lib/queryClient.ts`
- DB types (auto-generated): `src/types/database.types.ts`
- Supabase client: `src/lib/supabase/client.ts` (PKCE flow)
- Env config: `src/lib/env.ts` (Zod-validated, NEXT_PUBLIC_ prefixed)
- Theme tokens: `src/app/globals.css` (`:root` CSS variables)
- Test setup: `src/test/setup.ts`
- Form schemas: `src/features/{name}/schemas.ts`

## Path Alias

`@/*` maps to `apps/web/src/*` — use `@/lib/...`, `@/components/...`, `@/features/...`

## Workflow

### 1. Planning First
- Enter planning mode for ANY non-trivial task (more than 3 steps or architectural decisions)
- If something goes wrong, STOP and go back to planning immediately; don't keep pushing
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents frequently to keep the main context window clean
- Delegate research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### 3. Verify Before Finishing
- Never mark a task as complete without proving it works
- Compare the diff between the main branch and your changes when relevant
- Run tests, check logs, and prove code correctness

### 4. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple and obvious fixes; don't over-engineer

### 5. Autonomous Error Correction
- When you receive an error report: just fix it. Don't ask for hand-holding.
- Identify logs, errors, or failing tests and then resolve them

## Task Management

1. **Plan First**: Write the plan in `tasks/todo.md` with verifiable items
2. **Track Progress**: Mark items as completed as you advance
3. **Document Results**: Add a review section to `tasks/todo.md`

## Core Principles

- **Simplicity First**: Make each change as simple as possible. Affect minimum code necessary.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimum Impact**: Changes should only touch what's necessary. Avoid introducing errors.

## Token Optimization

### Model Selection for Subagents
- Use `model: "haiku"` for quick searches, file reads, simple grep tasks
- Use `model: "sonnet"` (default) for code writing, analysis, multi-step tasks
- Use `model: "opus"` only for complex architectural decisions or multi-file refactors

### Subagent Delegation
- Delegate research and exploration to subagents to keep main context clean
- One task per subagent for focused execution
- Launch independent subagents in parallel (single message, multiple Agent calls)
- Use `run_in_background: true` for non-blocking research

### Context Budget
- Read only the files you need — use Glob/Grep to find targets first
- For large files, use `offset` and `limit` parameters in Read
- Prefer Edit over Write for modifications (sends only the diff)
- Extract long outputs to subagents to prevent context bloat
