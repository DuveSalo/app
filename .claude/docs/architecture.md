# Architecture

## Monorepo Structure

pnpm workspace monorepo:

```
escuela-segura-monorepo/
├── apps/
│   └── web/                # Next.js 16 app
│       ├── src/app/        # Next.js App Router (landing, legal pages, SEO)
│       │   ├── layout.tsx  # Root layout (metadata, fonts, JSON-LD)
│       │   ├── page.tsx    # Landing page (SSR)
│       │   └── app/[[...slug]]/  # Client-only catch-all → SPA dashboard
│       └── src/            # Shared app code (see below)
├── packages/               # Shared packages (future)
├── supabase/               # Edge Functions + config
└── pnpm-workspace.yaml
```

## App Source Directory (`apps/web/src/`)

```
src/
├── app/                # Next.js App Router pages
├── features/           # Domain modules (one folder per feature)
│   ├── auth/           # Login, onboarding, subscription
│   ├── dashboard/
│   ├── fire-extinguishers/   # Canonical feature pattern
│   ├── conservation-certificates/
│   ├── self-protection-systems/
│   ├── qr/
│   ├── event-information/
│   ├── notifications/
│   ├── settings/
│   └── audit/
├── components/
│   ├── common/         # Shared UI (Button, Input, Select, Card, Table, etc.)
│   ├── landing/        # Landing page components (Header, Footer, sections)
│   ├── layout/         # PageLayout, AuthLayout, MainLayout, Sidebar, MobileNav
│   └── ui/             # shadcn/ui base — do NOT modify
├── lib/
│   ├── api/services/   # One file per domain entity
│   ├── api/mappers.ts  # Shared DB→domain mappers
│   ├── supabase/       # Supabase client
│   ├── mercadopago/    # MercadoPago SDK config
│   ├── utils/          # Error classes, helpers
│   └── env.ts          # Zod-validated environment config
├── routes/             # Route config + ProtectedRoute guard
├── constants/          # ROUTE_PATHS, MODULE_TITLES
└── types/              # Shared types + database.types.ts (auto-generated)
```

## Feature Module Pattern

Canonical example: `src/features/fire-extinguishers/`

```
fire-extinguishers/
├── components/         # Feature-specific UI components
├── hooks/              # Feature-specific hooks
├── types.ts            # Feature types (when needed beyond src/types/)
├── FireExtinguisherListPage.tsx
└── CreateEditFireExtinguisherPage.tsx
```

## Layout System

- **MainLayout** — sidebar + content area, wraps all authenticated routes
- **PageLayout** — header (title, subtitle, actions, NotificationBell) + scrollable body + optional footer. Used by all main pages
- **AuthLayout** — two variants via `variant` prop:
  - `split`: decorative panel + form (login/register)
  - `wizard`: stepper + centered content (onboarding: create company, subscribe)

## API Service Layer

One file per entity in `src/lib/api/services/`. Conventions:

- **Column selection**: prefer explicit `.select('id, name, status')` over `.select('*')` for new queries
- **N+1 prevention**: use relational queries (`.select('*, employees(*)')`) instead of separate fetches
- **Mappers**: `mapXFromDb` functions convert snake_case DB rows → camelCase domain types. Shared mappers in `src/lib/api/mappers.ts`
- **Error handling**: `handleSupabaseError(error)` wraps Supabase errors; custom `AuthError`, `NotFoundError` classes in `src/lib/utils/errors`
- **Pagination**: offset-based (`PaginationParams`) or cursor-based (`CursorPaginationParams`)
- **Edge Function calls**: `supabase.functions.invoke('function-name', { body })` — see [supabase-edge-functions.md](supabase-edge-functions.md)

## Environment Config

Validated at startup via Zod in `src/lib/env.ts`. Feature code must import from `env.ts`:

```ts
import { env } from '@/lib/env';
// Never: process.env.NEXT_PUBLIC_SUPABASE_URL
```

Variables use `NEXT_PUBLIC_` prefix (Next.js convention).

## Routing

Two routing layers:

1. **Next.js App Router** — landing page (`/`), legal pages (`/privacidad`, `/terminos`), SEO (sitemap, robots)
2. **React Router SPA** — dashboard at `/app/*`, mounted via client-only catch-all `src/app/app/[[...slug]]/`

SPA routing:
- **BrowserRouter** (basename `/app`) with `React.lazy()` for all page components
- Route definitions: `src/routes/routes.config.ts` (LazyPages object, QR_MODULE_ROUTES, PLACEHOLDER_ROUTES)
- Route paths: `src/constants/routes.ts` (ROUTE_PATHS, MODULE_TITLES)
- **ProtectedRoute** — 3-level guard:
  1. No user → `/login`
  2. No company → `/create-company`
  3. No subscription → `/subscribe` (allows `/settings` and `/subscribe/*` through)
  4. Fully onboarded user hitting auth routes → redirect to `/dashboard`
