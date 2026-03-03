# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm install                          # Install all workspace dependencies
pnpm dev                              # Start Next.js dev server (port 3000)
pnpm build                            # Production build (all workspaces)

# Testing
cd apps/web
pnpm test                             # Vitest watch mode
pnpm test:run                         # Vitest single run
pnpm vitest run src/lib/utils/dateUtils.test.ts   # Run a single test file
pnpm test:coverage                    # Unit tests with coverage
pnpm test:e2e                         # Playwright E2E (must have dev server running)
pnpm test:e2e:headed                  # E2E in headed browser

# Formatting
cd apps/web && pnpm format            # Prettier

# Supabase
npx supabase start                    # Local Supabase
npx supabase functions serve          # Serve Edge Functions locally
npx supabase db push                  # Push migrations to remote
npx supabase functions deploy <name>  # Deploy a single Edge Function
```

## Architecture

**Monorepo**: pnpm workspace — `apps/web` (Next.js 16 + React 19), `supabase/` (Edge Functions + migrations), `e2e/` (Playwright).

**Hybrid routing**: Next.js App Router handles SSR pages (`/`, `/privacidad`, `/terminos`). A catch-all route at `src/app/app/[[...slug]]/` mounts a React Router SPA (basename `/app`) for the entire authenticated dashboard. All SPA page components are `React.lazy()` loaded.

**State**: Single `AuthContext` (user + company + auth methods). No Redux/Zustand — pages use local `useState`/`useEffect`. Custom `useForm` and `useEntityForm` hooks for form management.

**Backend**: Supabase (Postgres + Auth + Storage + Edge Functions). Auth uses PKCE flow. All DB interaction goes through service files in `src/lib/api/services/` with mapper functions converting snake_case rows to camelCase domain types.

**Payments**: MercadoPago subscriptions managed via Supabase Edge Functions (`supabase/functions/mp-*`).

### Key directories (`apps/web/src/`)

| Path | Purpose |
|---|---|
| `features/{name}/` | Domain modules — page components + feature-specific components/hooks |
| `components/common/` | Shared UI: Button, Input, Select, Table, Modal, Toast, etc. (custom CVA-based) |
| `components/ui/` | **shadcn/ui primitives — do NOT modify** |
| `components/layout/` | MainLayout, Sidebar, MobileNav, PageLayout, AuthLayout |
| `lib/api/services/` | One service file per entity (auth, company, certificate, etc.) |
| `lib/api/mappers.ts` | DB row → domain type converters |
| `lib/supabase/client.ts` | Typed Supabase client singleton |
| `lib/utils/` | Error classes, logger, dateUtils, validation, sanitization |
| `lib/env.ts` | Zod-validated env config — always import `env` from here, never `process.env` |
| `routes/` | Route config (`routes.config.ts`) + `ProtectedRoute` auth guard |
| `constants/` | `ROUTE_PATHS`, `MODULE_TITLES`, config values |
| `types/` | Domain types + `database.types.ts` (auto-generated from Supabase) |

### Feature module pattern

Canonical example: `features/fire-extinguishers/`

```
fire-extinguishers/
├── components/          # Feature-specific UI
├── hooks/               # Feature-specific hooks
├── types.ts             # Feature-specific types (when needed)
├── FireExtinguisherListPage.tsx
└── CreateEditFireExtinguisherPage.tsx
```

### Layout hierarchy

`MainLayout` (sidebar + content) → `PageLayout` (header + body + optional footer) → feature page content. Auth flows use `AuthLayout` with `split` (login/register) or `wizard` (onboarding) variants.

### ProtectedRoute guard (4 levels)

1. No user → `/login`
2. No company → `/create-company`
3. No active subscription/trial → `/trial-expired` or `/subscribe`
4. Already-onboarded user on auth pages → `/dashboard`

## Conventions

- **Env vars**: Use `NEXT_PUBLIC_` prefix. Add to Zod schema in `lib/env.ts` before use. Import `env` from `@/lib/env`, never `process.env` directly.
- **Services**: One file per entity. Use explicit `.select('col1, col2')` over `.select('*')`. Always run results through `mapXFromDb()` mappers.
- **Error handling**: Use `handleSupabaseError()` to wrap Supabase errors. Typed hierarchy: `AppError` → `AuthError`, `ValidationError`, `NotFoundError`, `DatabaseError`, `NetworkError`.
- **Icons**: Lucide exclusively (`lucide-react`).
- **Styling**: Tailwind v4 (CSS-first config in `globals.css`). shadcn/ui `new-york` style with `neutral` palette. CVA for component variants.
- **Dates**: `date-fns` for all date operations.
- **XSS**: Sanitize user input with `lib/utils/sanitize.ts` (DOMPurify).
- **Supabase Edge Functions**: Auth pattern is extract JWT → verify → business logic. Use `_shared/supabase-admin.ts` for RLS bypass. CORS via `_shared/cors.ts`.
- **Migrations**: Name as `YYYYMMDD[_sequence]_description.sql`. Use `IF NOT EXISTS`. Every new table must have RLS policies.
- **Types**: `database.types.ts` is auto-generated from Supabase — don't edit manually.
