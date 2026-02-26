# Supabase Edge Functions

Deno-based Edge Functions in `supabase/functions/`. Handle the MercadoPago subscription lifecycle.

## Security

Edge Functions use `service_role` key via `_shared/supabase-admin.ts`, which **bypasses RLS**. This is intentional — functions validate auth via JWT headers first, then use the admin client for cross-user operations. Never expose `service_role` to client code.

## Shared Utilities (`_shared/`)

| File | Purpose |
|------|---------|
| `cors.ts` | CORS headers (`Access-Control-Allow-Origin: *`) |
| `supabase-admin.ts` | Service-role Supabase client (bypasses RLS) |
| `mp-auth.ts` | `MercadoPagoError` class, `getMpConfig()`, `getMpHeaders()`, `mpFetch()` with retry (3x, exponential backoff for 5xx/429) |
| `mp-plans.ts` | Plan metadata (basico ARS 25000, profesional ARS 49000, enterprise ARS 89000), `isValidMpPlanKey()` |
| `resend.ts` | Email sending via Resend API |
| `email-templates.ts` | HTML email templates for subscription events |

## Edge Functions

### mp-create-subscription
- **Auth**: JWT required
- Creates MercadoPago subscription (preapproval) with card_token_id
- Charges immediately — subscription is active if first payment succeeds
- Inserts DB record, updates company `is_subscribed` and `selected_plan`
- Returns `{ success, subscriptionId, status }`

### mp-manage-subscription
- **Auth**: JWT required
- Actions: `change_plan`, `change_card`, `cancel`, `pause`, `reactivate`
- Calls MercadoPago PUT `/preapproval/{id}`, updates local DB + company records
- Syncs `next_billing_time` from MP API response after every action
- Sends email notifications for each action type

### webhook-mercadopago
- **Auth**: No JWT (MercadoPago webhook callback)
- Verifies webhook signature with HMAC-SHA256
- Idempotent: logs events in `mp_webhook_log`, skips if already processed
- Handles: `subscription_preapproval` (status sync), `subscription_authorized_payment` (payment recording)
- Updates `next_billing_time` after recording payments

### cron-check-subscriptions
- **Auth**: `service_role` key (CRON job, no user context)
- Syncs active MercadoPago subscriptions with API
- Updates `next_billing_time` from preapproval state
- Revokes access for cancelled subscriptions past grace period

### send-expiration-emails
- Sends expiration notification emails

## Client-Side Integration

- `src/lib/mercadopago/config.ts` — MercadoPago public key config
- `src/features/auth/components/CardForm.tsx` — Secure Fields card form
- `src/lib/api/services/subscription.ts` — calls Edge Functions via `supabase.functions.invoke()`
- `src/types/subscription.ts` — `Subscription`, `PaymentTransaction`, request/response types

## Edge Function Environment Variables (Supabase Secrets)

```
MP_MODE                     # "sandbox" or "production"
MP_ACCESS_TOKEN             # MercadoPago access token
MP_WEBHOOK_SECRET           # Webhook signing secret
MP_PLAN_ID_BASICO
MP_PLAN_ID_PROFESIONAL
MP_PLAN_ID_ENTERPRISE
RESEND_API_KEY              # Resend email API key
SUPABASE_URL                # Auto-provided by Supabase
SUPABASE_ANON_KEY           # Auto-provided
SUPABASE_SERVICE_ROLE_KEY   # Auto-provided
```
