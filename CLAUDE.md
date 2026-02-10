# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SafetyGuard Pro is a safety compliance management SaaS application built with React 19, TypeScript 5.8, and Vite 6.2. It uses Supabase for backend (PostgreSQL, Auth, Storage) and Tailwind CSS with a custom Attio-inspired design system.

## Commands

```bash
npm run dev              # Start dev server on port 3000
npm run build            # Production build
npm run test             # Run tests in watch mode
npm run test:run         # Single test run
npm run test:coverage    # Generate coverage report
npm run format           # Format with Prettier
```

## Architecture

### Feature-Based Structure
- `src/features/` - Domain modules (auth, dashboard, fire-extinguishers, conservation-certificates, etc.)
- `src/components/common/` - Shared reusable components
- `src/components/ui/` - Base styled components (shadcn/ui)
- `src/lib/api/services/` - API service layer with Supabase
- `src/types/` - TypeScript types including database.types.ts (auto-generated from Supabase)

### Key Files
- `src/App.tsx` - Main router with HashRouter
- `src/routes/routes.config.ts` - Centralized route definitions with lazy loading
- `src/routes/ProtectedRoute.tsx` - Multi-level auth guard (user → company → subscription)
- `src/features/auth/AuthContext.tsx` - Global authentication state
- `src/lib/supabase/client.ts` - Main Supabase client

### Authentication Flow
HashRouter with Google OAuth → AuthContext manages state → ProtectedRoute guards routes → Onboarding: Login → Create Company → Subscription → Dashboard

### Path Aliases
Use `@/*` for imports from `src/` (e.g., `@/components/ui/Button`)

## Environment Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
```

## Database
Supabase with migrations in `/supabase/migrations/`. Key tables: users, companies, employees, conservation_certificates, fire_extinguishers, self_protection_systems, qr_documents, events, notifications, audit_logs.

## Testing
Vitest with jsdom, React Testing Library. Mocks configured for matchMedia, IntersectionObserver, ResizeObserver.

## Design System
Custom Tailwind config. Use `gray-*` for all neutral colors (NEVER `slate-*`).
Status colors: `emerald` (success), `amber` (warning), `red` (danger), `blue` (info).
See `.interface-design/system.md` for full design system reference.
IMPORTANT: Do NOT use semantic tokens like `text-content-primary`, `bg-surface-primary` — they don't exist in the Tailwind config.

## Feature Structure Convention
Use `src/features/fire-extinguishers/` as the canonical pattern:
- `components/` - Feature-specific UI components
- `hooks/` - Feature-specific hooks
- `types.ts` - Feature-specific types (when needed beyond src/types/)
