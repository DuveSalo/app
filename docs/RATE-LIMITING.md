# Rate Limiting

## Overview

Rate limiting is not yet implemented in Escuela Segura. This document outlines the plan for adding rate limiting to all Supabase Edge Functions and auth endpoints as a defense-in-depth measure against abuse, brute-force attacks, and denial-of-service attempts.

## Endpoints and Recommended Limits

| Function | Limit | Identifier |
|---|---|---|
| `webhook-mercadopago` | 100 req/min | IP |
| `mp-create-subscription` | 5 req/min | User ID |
| `mp-manage-subscription` | 10 req/min | User ID |
| `mp-get-subscription-status` | 20 req/min | User ID |
| `send-welcome-email` | 3 req/hour | User ID |
| `send-expiration-emails` | 1 req/min | CRON (service_role) |
| `cron-check-subscriptions` | 1 req/min | CRON (service_role) |
| Auth (Supabase built-in) | Configured via `max_frequency` | Email |
| Password reset | 3 req/hour | Email |

## Recommended Implementation

Use [Upstash Redis](https://upstash.com/) with the `@upstash/ratelimit` package. Upstash provides a serverless Redis instance with a REST API that works well in Deno Edge Functions (no persistent TCP connections required).

### Why Upstash?

- **Serverless-friendly**: REST-based API, no connection pooling needed
- **Deno-compatible**: Works out of the box with Supabase Edge Functions
- **Sliding window algorithm**: Provides smooth rate limiting without burst spikes
- **Low latency**: Global edge deployment minimizes round-trip time

## Code Example

The following example shows how to integrate rate limiting into a Supabase Edge Function running on Deno:

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
})

// In the handler:
const identifier = userId || ip
const { success } = await ratelimit.limit(identifier)
if (!success) {
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: { "Content-Type": "application/json" }
  })
}
```

### Per-Function Configuration

Each function should create its own `Ratelimit` instance with the appropriate limit from the table above. For example:

```typescript
// mp-create-subscription: strict limit
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "ratelimit:mp-create-subscription",
})

// webhook-mercadopago: higher limit for external webhooks
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "ratelimit:webhook-mercadopago",
})
```

## Environment Variables Needed

Add the following environment variables to each Supabase Edge Function that requires rate limiting:

| Variable | Description |
|---|---|
| `UPSTASH_REDIS_REST_URL` | The REST API URL for your Upstash Redis instance |
| `UPSTASH_REDIS_REST_TOKEN` | The authentication token for your Upstash Redis instance |

These can be set via the Supabase Dashboard under Edge Functions > Secrets, or via the CLI:

```bash
npx supabase secrets set UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
npx supabase secrets set UPSTASH_REDIS_REST_TOKEN=your-token-here
```

## Supabase Auth Rate Limiting

Supabase Auth has built-in rate limiting configured via `config.toml`:

- `max_frequency`: Minimum time between OTP/magic link emails (currently set in project config)
- Additional CAPTCHA integration can be enabled for sign-up and sign-in flows

These built-in limits are separate from the Edge Function rate limiting described above.

## Implementation Priority

1. **High**: `webhook-mercadopago` (publicly accessible, no auth required)
2. **High**: `mp-create-subscription` (financial operation, low expected volume)
3. **Medium**: `mp-manage-subscription`, `mp-get-subscription-status`
4. **Low**: CRON functions (already protected by `service_role` key)
