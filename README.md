# Escuela Segura

Safety compliance management SaaS for schools. Built with Next.js 16, React 19, pnpm workspaces, and Supabase.

## Repository layout

```text
apps/web/   Next.js application deployed to Vercel
supabase/   Supabase migrations, Edge Functions, and backend configuration
docs/       Operational documentation
```

## Prerequisites

- Node.js 22.x (see `.node-version` and `engines`)
- pnpm 10.30.2 (declared in `packageManager`)
- Supabase project
- MercadoPago public key for browser card tokenization

## Getting started

```bash
# Install dependencies
pnpm install

# Start the web app locally
pnpm dev

# Run non-build verification
pnpm run verify
```

## Environment variables

Create `apps/web/.env.local` from `apps/web/.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_MP_PUBLIC_KEY=<your-mp-public-key>
NEXT_PUBLIC_APP_URL=https://<your-production-domain>
# NEXT_PUBLIC_LOG_LEVEL=info
```

Only public browser-safe values belong in `NEXT_PUBLIC_*` variables. Keep private credentials such as Supabase service-role keys, MercadoPago access tokens, webhook secrets, and Resend keys out of the web app environment.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js web app |
| `pnpm build` | Build the web app for production |
| `pnpm start` | Start the production server after a build |
| `pnpm run audit:prod` | Audit production dependencies |
| `pnpm run typecheck` | Run TypeScript typecheck with no emit |
| `pnpm run test:run` | Run unit tests once |
| `pnpm run verify` | Run audit, typecheck, and unit tests without a local build |

## Vercel deployment

See [`docs/VERCEL.md`](docs/VERCEL.md) for the exact Vercel project settings, required environment variables, Supabase redirect URL checklist, and CI verification details.

## Architecture

- **Next.js App Router**: `apps/web/src/app/`
- **Client app shell**: `apps/web/src/App.tsx`
- **Features**: `apps/web/src/features/{name}/`
- **Common UI**: `apps/web/src/components/common/`
- **shadcn/ui**: `apps/web/src/components/ui/` (do not modify casually)
- **API services**: `apps/web/src/lib/api/services/`
- **Edge Functions**: `supabase/functions/`

See [`CLAUDE.md`](CLAUDE.md) for full architecture details.
