# AGENTS.md — Escuela Segura

Safety compliance management SaaS for schools. React 19 + Vite 6 + Supabase + TypeScript + Tailwind CSS 3.

## How to Use This Guide

This is the **root-level** instruction file. Each major directory has its own `AGENTS.md` with component-specific rules:

| Component | Location | Tech Stack |
|-----------|----------|------------|
| Auth & Onboarding | `src/features/auth/AGENTS.md` | React, Supabase Auth, MercadoPago SDK |
| Dashboard | `src/features/dashboard/AGENTS.md` | React, Charts, Data aggregation |
| Fire Extinguishers | `src/features/fire-extinguishers/AGENTS.md` | Canonical CRUD feature |
| Settings | `src/features/settings/AGENTS.md` | User/Company/Billing management |
| API Services | `src/lib/AGENTS.md` | Supabase client, services, utils |
| Edge Functions | `supabase/AGENTS.md` | Deno, MercadoPago webhooks, CRON |

**Rule**: Always read the nearest `AGENTS.md` before modifying files in that directory.

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build (~40s)
npm run test         # Run vitest (watch mode)
npm run test:run     # Single test run
npm run test:coverage # Coverage report
npm run format       # Prettier on src/**/*.{ts,tsx,css,md}
```

## Project Structure

```
src/
├── features/              # Domain modules (one folder per feature)
│   ├── auth/              # Login, onboarding, subscription checkout
│   ├── dashboard/         # Main data hub
│   ├── fire-extinguishers/ # Canonical CRUD pattern — use as template
│   ├── conservation-certificates/
│   ├── self-protection-systems/
│   ├── qr/                # QR code document modules
│   ├── event-information/
│   ├── notifications/
│   ├── settings/          # User, company, billing
│   ├── audit/             # Audit trail
│   └── placeholders/      # Future features
├── components/
│   ├── common/            # Shared UI (Button, Input, Select, Card, Table, Modal, etc.)
│   ├── layout/            # PageLayout, AuthLayout, MainLayout, Sidebar, MobileNav
│   └── ui/                # shadcn/ui base — DO NOT MODIFY
├── lib/
│   ├── api/services/      # One file per domain entity
│   ├── api/mappers.ts     # DB → domain mappers
│   ├── supabase/          # Supabase client config
│   ├── mercadopago/       # MercadoPago SDK config
│   ├── hooks/             # Shared hooks (useForm, useEntityForm)
│   ├── utils/             # Errors, validation, logger, helpers
│   └── env.ts             # Zod-validated environment config
├── routes/                # Route config + ProtectedRoute guard
├── constants/             # ROUTE_PATHS, MODULE_TITLES, geographic data
├── types/                 # Shared types + auto-generated database.types.ts
└── config/                # Logger config
```

## CRITICAL RULES — NON-NEGOTIABLE

### Architecture
- **Feature isolation**: Each feature is self-contained in `src/features/{name}/`. Components, hooks, and types stay within their feature unless shared by 2+ features.
- **Canonical pattern**: Always reference `src/features/fire-extinguishers/` as the template for new CRUD features.
- **No circular imports**: Features must NOT import from other features. Shared code goes in `src/lib/` or `src/components/common/`.
- **shadcn/ui is read-only**: NEVER modify files in `src/components/ui/`. Customize via Tailwind classes in consuming components.

### Environment & Config
- **Always** import env from `@/lib/env`, NEVER from `import.meta.env` directly.
- **Zod validates** all environment variables at startup — add new vars to `src/lib/env.ts` schema.
- Sensitive keys (MercadoPago secrets, service_role) belong in Supabase Edge Function secrets, NEVER in client code.

### API Layer
- One service file per entity in `src/lib/api/services/`.
- Prefer explicit `.select('id, name, status')` over `.select('*')`.
- Use `mapXFromDb` mappers for snake_case → camelCase conversion.
- Handle errors with `handleSupabaseError()` from `@/lib/utils/errors`.

### Routing
- HashRouter with `React.lazy()` for all page components.
- Route definitions: `src/routes/routes.config.ts`.
- Route paths: `src/constants/routes.ts`.
- ProtectedRoute enforces 3-level guard: user → company → subscription.

### Design System
- Use `gray-*` for ALL neutral colors. **NEVER** use `slate-*`.
- Status colors: `emerald` (success), `amber` (warning), `red` (danger), `blue` (info).
- See `.interface-design/system.md` for full reference.

## Auth Flow

```
Google OAuth → AuthContext → ProtectedRoute → Onboarding
Login → Create Company → Subscribe (MercadoPago) → Dashboard
```

Guard levels in `ProtectedRoute.tsx`:
1. No user → `/login`
2. No company → `/create-company`
3. No subscription (and trial expired) → `/subscribe`
4. Fully onboarded user on auth routes → redirect to `/dashboard`

## Security Rules

- **Input validation**: Zod schemas at environment boundaries. Sanitize all user-generated content before rendering with `dangerouslySetInnerHTML` (prefer avoiding it entirely).
- **XSS prevention**: React escapes by default. Never use `dangerouslySetInnerHTML` unless absolutely necessary. If needed, sanitize with DOMPurify.
- **CSRF**: Supabase uses PKCE auth flow — no CSRF tokens needed for API calls.
- **Secrets**: Client-side code may only access `VITE_*` env vars. MercadoPago secrets live exclusively in Supabase Edge Function environment.
- **RLS**: Supabase Row-Level Security is enabled on all tables. Edge Functions use `service_role` for cross-user ops only after validating JWT.
- **Content Security Policy**: Defined in `index.html` meta tag. Update when adding new external resources.
- See `SECURITY.md` for vulnerability disclosure policy.

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Feature folder | kebab-case | `fire-extinguishers/` |
| Page component | PascalCase + Page suffix | `FireExtinguisherListPage.tsx` |
| Service file | camelCase | `fireExtinguisher.ts` |
| Type file | kebab-case | `fire-extinguisher.ts` |
| Hook | camelCase with `use` prefix | `useFireExtinguisherValidation.ts` |
| Mapper function | `mapXFromDb` | `mapFireExtinguisherFromDb` |
| Route constant | SCREAMING_SNAKE_CASE | `ROUTE_PATHS.FIRE_EXTINGUISHERS` |
| DB table | snake_case plural | `fire_extinguishers` |
| Edge Function | kebab-case | `create-subscription/` |

## Commit Convention

```
<type>: <short description>

Types: feat, fix, refactor, style, docs, test, chore, perf
```

## QA Checklist (Before Commit)

- [ ] `npm run build` passes without errors
- [ ] `npm run test:run` passes
- [ ] No `slate-*` classes in new/modified files
- [ ] No `import.meta.env` direct access (use `@/lib/env`)
- [ ] No secrets or API keys in client-side code
- [ ] No `any` types unless absolutely unavoidable
- [ ] New features follow the canonical `fire-extinguishers/` pattern
- [ ] Supabase queries use explicit `.select()` columns

## Deep Dives

- [Architecture & service layer](.claude/docs/architecture.md)
- [Edge Functions & MercadoPago billing](.claude/docs/supabase-edge-functions.md)
- [Design system reference](.interface-design/system.md)
