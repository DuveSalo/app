# Vercel Deployment

This repository is a pnpm monorepo. The deployable Next.js app lives in `apps/web`.

## Recommended Vercel project settings

When importing the GitHub repository into Vercel, use these settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Install Command | default / auto-detected |
| Build Command | default `pnpm run build` |
| Output Directory | default for Next.js |
| Node.js Version | `22.x` |

Do **not** override the output directory for Next.js. Let Vercel's Next.js preset handle it.

The root `package.json` pins `pnpm@10.30.2` through `packageManager`, and both root and web package files declare Node `22.x` through `engines`. The repository also includes `.node-version` for local tooling.

## Required Vercel environment variables

Set these in **Vercel Project Settings > Environment Variables** for Production and Preview:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_MP_PUBLIC_KEY=<mercadopago-public-key>
NEXT_PUBLIC_APP_URL=https://<your-production-domain>
```

Optional:

```bash
NEXT_PUBLIC_LOG_LEVEL=info
```

Important: every `NEXT_PUBLIC_*` variable is exposed to the browser. Do not put Supabase service-role keys, MercadoPago access tokens, webhook secrets, Resend keys, or any private credential in Vercel public variables.

## Supabase settings to update after the Vercel domain exists

In Supabase Auth settings, allow the deployed app origin and callback routes used by the client:

```text
https://<your-production-domain>/app/auth/callback
https://<your-production-domain>/app/reset-password
https://<your-preview-domain>/app/auth/callback
https://<your-preview-domain>/app/reset-password
```

Backend/private secrets for Supabase Edge Functions remain in Supabase, not in Vercel:

```bash
MP_ACCESS_TOKEN
MP_WEBHOOK_SECRET
RESEND_API_KEY
CRON_SECRET
```

## Local pre-deploy verification

Run this before pushing deployment changes:

```bash
pnpm run verify
```

That command runs:

1. `pnpm audit --prod`
2. `pnpm --filter web exec tsc --noEmit`
3. `pnpm --filter web run test:run`

It intentionally does not run a local production build because this project's agent instructions prohibit builds after changes.

## GitHub verification

`.github/workflows/verify.yml` runs audit, typecheck, and unit tests on pushes and pull requests to `main`. It also avoids local production builds for the same reason.
