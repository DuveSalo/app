# Escuela Segura

Safety compliance management SaaS for schools. Built with React 19 + Vite + Supabase.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (package manager)
- Supabase project (for backend)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

Create a `.env.local` file:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_MP_PUBLIC_KEY=<mercadopago-public-key>
```

Optional:
```
VITE_GEMINI_API_KEY=<gemini-api-key>
VITE_LOG_LEVEL=debug|info|warn|error
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run unit tests in watch mode |
| `pnpm test:run` | Run unit tests once |
| `pnpm test:coverage` | Run unit tests with coverage report |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm test:e2e:ui` | Run E2E tests with Playwright UI |
| `pnpm test:e2e:headed` | Run E2E tests in headed browser |

## Testing

See [TESTING.md](TESTING.md) for testing conventions, structure, and how to add tests.

## Architecture

- **Features**: `src/features/{name}/` — domain modules
- **Common UI**: `src/components/common/`
- **shadcn/ui**: `src/components/ui/` (do not modify)
- **API services**: `src/lib/api/services/`
- **Edge Functions**: `supabase/functions/`

See [CLAUDE.md](CLAUDE.md) for full architecture details.
