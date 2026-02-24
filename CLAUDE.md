# CLAUDE.md

## Project

Escuela Segura — safety compliance management SaaS for schools (React + Vite + Supabase).

## Commands

```bash
npm run dev / build / test / test:run / test:coverage / format
```

## Architecture

- **Features**: `src/features/{name}/` — domain modules with `components/`, `hooks/`, `types.ts`
- **Common UI**: `src/components/common/` (Button, Input, Select, Card, Table, etc.)
- **shadcn/ui**: `src/components/ui/` — base components, do NOT modify
- **Layouts**: PageLayout (all main pages), AuthLayout (split for login, wizard for onboarding)
- **API services**: `src/lib/api/services/` — one file per entity, prefer explicit `.select()` columns, `mapXFromDb` mappers
- **Edge Functions**: `supabase/functions/` — PayPal billing lifecycle (see deep dives)
- **Types**: `src/types/` + auto-generated `database.types.ts`

## Key Files

- `src/App.tsx` — HashRouter with `React.lazy()` routes
- `src/routes/ProtectedRoute.tsx` — 3-level guard: user → company → subscription
- `src/features/auth/AuthContext.tsx` — global auth state
- `src/lib/env.ts` — Zod-validated env config (always import from here, not `import.meta.env`)

## Auth Flow

Google OAuth → AuthContext → ProtectedRoute → Onboarding: Login → Create Company → Subscribe (PayPal) → Dashboard

## Environment Variables

```
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_PAYPAL_CLIENT_ID
VITE_GEMINI_API_KEY (optional), VITE_LOG_LEVEL (optional: debug|info|warn|error)
```

## Design System

Use `gray-*` for all neutral colors (NEVER `slate-*`). The Tailwind config defines semantic tokens (`content`, `surface`, `borderClr`, etc.) but feature code should use `gray-*` directly for consistency.
Status colors: `emerald` (success), `amber` (warning), `red` (danger), `blue` (info).
See `.interface-design/system.md` for the full reference.

## Conventions

- Canonical feature pattern: `src/features/fire-extinguishers/`
- Path alias: `@/*` → `src/*`

## Deep Dives

- [Architecture & service layer](.claude/docs/architecture.md)
- [Edge Functions & PayPal billing](.claude/docs/supabase-edge-functions.md)
