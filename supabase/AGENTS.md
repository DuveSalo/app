# Supabase Infrastructure

Deno-based Edge Functions, database migrations, and Supabase configuration.

## Architecture

```
supabase/
├── config.toml                    # Supabase local dev config
├── functions/
│   ├── _shared/                   # Shared utilities across functions
│   │   ├── cors.ts                # CORS headers (Access-Control-Allow-Origin)
│   │   ├── supabase-admin.ts      # Service-role client (bypasses RLS)
│   │   ├── paypal-auth.ts         # PayPal auth + retry logic
│   │   └── paypal-plans.ts        # Plan metadata + pricing
│   ├── create-subscription/       # Create PayPal subscription
│   ├── activate-subscription/     # Activate after PayPal approval
│   ├── manage-subscription/       # Cancel/Suspend/Reactivate
│   ├── webhook-paypal/            # PayPal webhook handler
│   ├── webhook-mercadopago/       # MercadoPago webhook handler
│   ├── mp-create-subscription/    # MercadoPago create subscription
│   ├── mp-manage-subscription/    # MercadoPago manage subscription
│   └── cron-check-subscriptions/  # Scheduled subscription sync
└── migrations/                    # SQL migration files (chronological)
```

## Critical Rules

### Security
- **service_role key** bypasses RLS — use ONLY in Edge Functions, NEVER in client code.
- **JWT validation first**: Every Edge Function that accepts user requests MUST validate the JWT from the Authorization header before proceeding.
- **Webhook signature verification**: `webhook-paypal` and `webhook-mercadopago` MUST verify webhook signatures before processing events.
- **Idempotent webhooks**: Always check if a webhook event has already been processed before applying changes.

### Edge Functions
- **Auth pattern**: Extract JWT → verify user → proceed with business logic.
- **Admin client**: Use `_shared/supabase-admin.ts` for operations that need RLS bypass.
- **CORS**: All functions use `_shared/cors.ts` for consistent CORS headers.
- **Error responses**: Return structured JSON errors with appropriate HTTP status codes.
- **PayPal retry**: `paypalFetch()` in `_shared/paypal-auth.ts` retries 3x with exponential backoff for 5xx/429 errors.

### Migrations
- **Naming**: `YYYYMMDD[_sequence]_description.sql` (e.g., `20250130000001_create_subscriptions_table.sql`).
- **Idempotent**: Migrations should use `IF NOT EXISTS`, `CREATE OR REPLACE` where possible.
- **RLS**: Every new table MUST have Row-Level Security policies. Check `20250205000003_add_rls_missing_tables.sql` for the pattern.
- **Never drop columns/tables** in production without a migration plan.

### Environment Variables (Supabase Secrets)

```
PAYPAL_MODE                 # "sandbox" or "live"
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_WEBHOOK_ID
PAYPAL_PLAN_ID_BASIC
PAYPAL_PLAN_ID_STANDARD
PAYPAL_PLAN_ID_PREMIUM
SUPABASE_URL                # Auto-provided
SUPABASE_ANON_KEY           # Auto-provided
SUPABASE_SERVICE_ROLE_KEY   # Auto-provided
```

## Useful Commands

```bash
# Local development
npx supabase start           # Start local Supabase
npx supabase functions serve  # Serve Edge Functions locally

# Deploy
npx supabase functions deploy <function-name>
npx supabase db push          # Push migrations

# Secrets
npx supabase secrets set KEY=VALUE
npx supabase secrets list
```
