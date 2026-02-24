# Supabase Edge Functions

Deno-based Edge Functions in `supabase/functions/`. Handle the PayPal subscription lifecycle.

## Security

Edge Functions use `service_role` key via `_shared/supabase-admin.ts`, which **bypasses RLS**. This is intentional — functions validate auth via JWT headers first, then use the admin client for cross-user operations. Never expose `service_role` to client code.

## Shared Utilities (`_shared/`)

| File | Purpose |
|------|---------|
| `cors.ts` | CORS headers (`Access-Control-Allow-Origin: *`) |
| `supabase-admin.ts` | Service-role Supabase client (bypasses RLS) |
| `paypal-auth.ts` | `PayPalError` class, `getPayPalConfig()`, `getAccessToken()` with caching, `getAuthHeaders()`, `paypalFetch()` with retry (3x, exponential backoff for 5xx/429) |
| `paypal-plans.ts` | Plan metadata (basic $25, standard $49, premium $89), `getPayPalPlanId()` reads env var per plan key |

## Edge Functions

### create-subscription
- **Auth**: JWT required
- Cancels existing active subscription if changing plans
- Creates PayPal subscription via API, inserts DB record with status `pending`
- Returns `{ subscriptionId }` for client-side PayPal JS SDK approval popup

### activate-subscription
- **Auth**: JWT required
- Called after user approves on PayPal. Verifies subscription status with PayPal API
- If `ACTIVE`: updates subscription + company records (`is_subscribed`, `selected_plan`)
- If `APPROVAL_PENDING`: sets status to `approval_pending`
- Idempotent (checks if already active before updating)

### manage-subscription
- **Auth**: JWT required
- Actions: `cancel`, `suspend`, `reactivate`
- Calls PayPal API endpoint, updates local DB + company records

### webhook-paypal
- **Auth**: No JWT (PayPal webhook callback)
- Verifies webhook signature with PayPal API
- Idempotent: logs events in `paypal_webhook_log`, skips if already processed
- Handles: `BILLING.SUBSCRIPTION.ACTIVATED/CANCELLED/SUSPENDED/EXPIRED`, `PAYMENT.SALE.COMPLETED/REFUNDED`

### cron-check-subscriptions
- **Auth**: `service_role` key (CRON job, no user context)
- Syncs active subscriptions with PayPal API
- Revokes access for cancelled subscriptions past grace period

## Client-Side Integration

- `src/lib/paypal/config.ts` — PayPal JS SDK script provider options
- `src/lib/paypal/PayPalProvider.tsx` — wraps children with `@paypal/react-paypal-js`
- `src/lib/api/services/subscription.ts` — calls Edge Functions via `supabase.functions.invoke()`
- `src/types/subscription.ts` — `Subscription`, `PaymentTransaction`, request/response types

## Edge Function Environment Variables (Supabase Secrets)

```
PAYPAL_MODE                 # "sandbox" or "live"
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_WEBHOOK_ID
PAYPAL_PLAN_ID_BASIC
PAYPAL_PLAN_ID_STANDARD
PAYPAL_PLAN_ID_PREMIUM
SUPABASE_URL                # Auto-provided by Supabase
SUPABASE_ANON_KEY           # Auto-provided
SUPABASE_SERVICE_ROLE_KEY   # Auto-provided
```
