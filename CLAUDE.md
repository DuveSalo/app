# CLAUDE.md

## Project

Escuela Segura — safety compliance management SaaS for schools (Next.js + Supabase).

## Monorepo Structure

pnpm workspace with apps and packages:

```
escuela-segura-monorepo/
├── apps/web/          # Next.js 16 app (React 19 + TypeScript)
├── packages/          # Shared packages (future)
├── supabase/          # Edge Functions + config
└── pnpm-workspace.yaml
```

## Commands

```bash
# Root (runs across all packages)
pnpm dev / build / test / lint

# Web app (from apps/web/)
pnpm dev              # next dev
pnpm build            # next build
pnpm test             # vitest
pnpm test:run         # vitest run
pnpm test:coverage    # vitest run --coverage
pnpm test:e2e         # playwright test
pnpm format           # prettier
```

## Architecture

All app code lives in `apps/web/src/`:

- **Landing page**: Next.js App Router — `src/app/page.tsx` (SSR, SEO, structured data)
- **SPA dashboard**: `src/app/app/[[...slug]]/` — client-only catch-all that mounts the React Router SPA under `/app`
- **Features**: `src/features/{name}/` — domain modules with `components/`, `hooks/`, `types.ts`
- **Common UI**: `src/components/common/` (Button, Input, Select, Card, Table, etc.)
- **Landing UI**: `src/components/landing/` (Header, Footer, Hero, Features, Pricing, etc.)
- **shadcn/ui**: `src/components/ui/` — base components, do NOT modify
- **Layouts**: PageLayout (all main pages), AuthLayout (split for login, wizard for onboarding)
- **API services**: `src/lib/api/services/` — one file per entity, prefer explicit `.select()` columns, `mapXFromDb` mappers
- **Edge Functions**: `supabase/functions/` — MercadoPago billing lifecycle (see deep dives)
- **Types**: `src/types/` + auto-generated `database.types.ts`

## Key Files

- `apps/web/src/app/layout.tsx` — Root layout with metadata, fonts, JSON-LD
- `apps/web/src/app/page.tsx` — Landing page (SSR)
- `apps/web/src/app/app/[[...slug]]/client.tsx` — Client-only SPA mount (BrowserRouter, basename `/app`)
- `apps/web/src/App.tsx` — React Router with `React.lazy()` routes (SPA dashboard)
- `apps/web/src/routes/ProtectedRoute.tsx` — 3-level guard: user → company → subscription
- `apps/web/src/features/auth/AuthContext.tsx` — global auth state
- `apps/web/src/lib/env.ts` — Zod-validated env config (always import from here, not `process.env`)

## Auth Flow

Google OAuth → AuthContext → ProtectedRoute → Onboarding: Login → Create Company → Subscribe (MercadoPago) → Dashboard

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_MP_PUBLIC_KEY
NEXT_PUBLIC_GEMINI_API_KEY (optional), NEXT_PUBLIC_LOG_LEVEL (optional: debug|info|warn|error)
```

## Design System

**Typography**: Bricolage Grotesque (headings, `--font-heading`), Outfit (body, `--font-sans`), JetBrains Mono (`--font-mono`).
**Primary color**: `brand-700` (#1A5C52, deep teal) for buttons, active states, accents.
**Neutrals**: Warm stone palette (`neutral-*`). Use `neutral-*` for all gray tones (NEVER `slate-*` or `gray-*`).
**Status colors**: `brand-*` (success/valid), `amber` (warning), `red` (danger), `blue` (info).
**Shadows**: Real shadows enabled — `shadow-card`, `shadow-md`, `shadow-dropdown`, etc.
**Border radius**: Generous — `rounded-lg` (inputs), `rounded-xl` (cards, badges), `rounded-2xl` (modals, large cards).
**Headings**: Always add `font-[family-name:var(--font-heading)]` to h1/h2/h3 and card titles.

## Conventions

- Canonical feature pattern: `apps/web/src/features/fire-extinguishers/`
- Path alias: `@/*` → `apps/web/src/*`
- Package manager: **pnpm** (never npm/yarn)
- Landing pages use Next.js App Router (SSR); dashboard uses client-only SPA via React Router

## Deep Dives

- [Architecture & service layer](.claude/docs/architecture.md)
- [Edge Functions & MercadoPago billing](.claude/docs/supabase-edge-functions.md)
