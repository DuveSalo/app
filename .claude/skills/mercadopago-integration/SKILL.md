---
name: mercadopago-subscriptions
description: >
  Integrate MercadoPago Subscriptions (recurring payments, redirect-based) into Next.js
  applications with any PostgreSQL database (Supabase, AWS RDS, Neon, PlanetScale,
  self-hosted, Prisma, Drizzle, or raw pg). Use when the user needs to: (1) Add
  MercadoPago recurring payment processing to a Next.js app, (2) Create a subscription
  flow with MercadoPago, (3) Set up subscription webhooks for MercadoPago, (4) Build
  subscription success/management pages, (5) Implement subscription plans with free
  trials and billing day configuration, (6) Handle subscription lifecycle (pause,
  cancel, reactivate), (7) Troubleshoot MercadoPago subscription integration issues.
  Triggers on requests mentioning MercadoPago subscriptions, suscripciones, recurring
  payments, preapproval, subscription plans, or pagos recurrentes. Supports all
  MercadoPago countries: Argentina (ARS), Brazil (BRL), Mexico (MXN), Colombia (COP),
  Chile (CLP), Peru (PEN), Uruguay (UYU).
---

# MercadoPago Subscriptions - Next.js Integration

Redirect-based subscription flow: user clicks "Subscribe", is redirected to MercadoPago, authorizes recurring payment, returns to the app. A webhook confirms the subscription status in the background.

## Quick Start

For a minimal integration, just tell Claude:

```
Integrar suscripciones de MercadoPago en mi app
```

Claude will automatically explore your codebase to detect:
- Database adapter (Supabase, Prisma, or raw pg)
- Existing routes and patterns
- Currency based on context

For more control, provide details:

```
Integrate MercadoPago Subscriptions.
Database: Prisma. Currency: ARS. Plan: monthly $5000.
Success route: /suscripcion-exitosa.
```

See `references/usage-examples.md` for more prompt templates.

## Subscription Models

MercadoPago supports two subscription models:

### 1. Without Associated Plan (Recommended for redirect flow)
Each subscription is unique per payer. Created via `POST /preapproval`. Two variants:
- **Pending payment**: User is redirected to MP to choose payment method (`status: "pending"`)
- **Authorized payment**: Payment method provided upfront via card_token (`status: "authorized"`)

### 2. With Associated Plan
First create a plan (`POST /preapproval_plan`), then create subscriptions linked to it (`POST /preapproval`). Requires `card_token_id` — typically used with Checkout Bricks or Checkout API, **not** redirect flow.

**This skill focuses on Model 1 (without plan) with pending payment** — the redirect-based approach analogous to Checkout Pro. The user is redirected to MercadoPago to select their payment method and authorize the subscription.

## Subscription Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUBSCRIPTION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

User clicks "Subscribe"
       │
       ▼
┌──────────────────────┐
│ POST /api/subscribe   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 1. Create subscription in DB     │
│    (status: pending)             │
│ 2. Create preapproval in MP API  │
│    (status: pending)             │
│ 3. Save preapproval_id in DB     │
│ 4. Return init_point URL         │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────┐      ┌──────────────────────────┐
│ Redirect to MP   │─────▶│ User authorizes on MP    │
└──────────────────┘      │ (selects payment method) │
                          └──────────┬───────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         │                                                       │
         ▼                                                       ▼
┌─────────────────────────┐                        ┌──────────────────────────┐
│ Redirect back to app    │                        │ MP sends webhook         │
│ /subscription-success   │                        │ type:                    │
│ ?preapproval_id=...     │                        │ subscription_preapproval │
└──────────┬──────────────┘                        │ POST /api/webhooks/mp    │
           │                                       └──────────┬───────────────┘
           ▼                                                  │
┌─────────────────────────┐                        ┌──────────┴───────────────┐
│ Verify status via API   │                        │ Fetch preapproval from   │
│ GET /api/subscriptions  │                        │ MP API → Update DB       │
│     /[id]               │                        │ (authorized/cancelled)   │
└──────────┬──────────────┘                        └──────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│ Show UI based on status │
│ authorized/pending/     │
│ paused/cancelled        │
└─────────────────────────┘
```

## Subscription Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Created but user hasn't authorized payment yet |
| `authorized` | Active subscription, payments will be charged automatically |
| `paused` | Temporarily paused by seller or buyer |
| `cancelled` | Permanently cancelled |

## Before Starting

1. **Determine the database adapter.** Explore the codebase or ask the user:
   - **Supabase?** See `references/database-supabase.md`
   - **Prisma?** See `references/database-prisma.md`
   - **Raw PostgreSQL (pg, Drizzle, etc.)?** See `references/database-postgresql.md`

2. **Gather or infer from the codebase:**

| Detail | Why | Example |
|--------|-----|---------|
| Currency | Subscription creation | `ARS`, `BRL`, `MXN` (see `references/countries.md`) |
| Success route | `back_url` in preapproval | `/subscription-success`, `/suscripcion-exitosa` |
| Subscription amount | `transaction_amount` in `auto_recurring` | `5000` (ARS), `29.90` (BRL) |
| Frequency | How often to charge | `1` month, `3` months, `1` year |
| Frequency type | Unit of frequency | `months` or `days` |
| Plan description | What the user is subscribing to | `"Plan Premium"`, `"Clases de Yoga"` |
| End date (optional) | When the subscription ends | `null` for indefinite |
| Free trial (optional) | Trial period before charging | `7 days`, `1 month` |

## Prerequisites

1. Install dependencies: `npm install mercadopago zod`
2. Set environment variables (**never** prefix access token with `NEXT_PUBLIC_`):
   ```env
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx   # from https://www.mercadopago.com/developers/panel/app
   NEXT_PUBLIC_APP_URL=http://localhost:3000  # HTTPS in production
   ```
3. Run database migration from `assets/migration.sql` (works on any PostgreSQL database).
4. **Configure webhook** in MercadoPago Developer Panel:
   - Go to Your integrations → Your application → Webhooks
   - Select topics: **Planes y Suscripciones** + **Pagos**
   - Set URL: `https://yourdomain.com/api/webhooks/mercadopago`

### Production Requirements

- **SSL Certificate**: Required for secure webhooks
- **Active MercadoPago seller account**: [Create here](https://www.mercadopago.com/developers/panel/app)
- **Publicly accessible webhook URL**: MercadoPago must reach your `/api/webhooks/mercadopago`

## Implementation Steps

### Step 1: Database Helper

**Create:** `src/lib/db/subscriptions.ts`

This abstracts all subscription DB operations. Implement using your DB adapter.
See the reference file for your adapter:
- Supabase: `references/database-supabase.md`
- Prisma: `references/database-prisma.md`
- Raw pg / other: `references/database-postgresql.md`

The helper must export these functions:

```typescript
interface SubscriptionInsert {
  user_email: string;
  reason: string;
  status: 'pending';
  amount: number;
  currency_id: string;
  frequency: number;
  frequency_type: 'months' | 'days';
  external_reference?: string;
}

interface SubscriptionUpdate {
  status?: 'pending' | 'authorized' | 'paused' | 'cancelled';
  mercadopago_preapproval_id?: string;
  mercadopago_payer_id?: string;
  user_email?: string;
  next_payment_date?: string;
  updated_at?: string;
}

// Required exports:
export async function createSubscription(data: SubscriptionInsert): Promise<{ id: string }>;
export async function updateSubscription(id: string, data: SubscriptionUpdate): Promise<void>;
export async function getSubscriptionStatus(id: string): Promise<{ id: string; status: string } | null>;
export async function getSubscriptionByPreapprovalId(preapprovalId: string): Promise<{ id: string; status: string } | null>;
export async function getUserActiveSubscription(email: string): Promise<{ id: string; status: string } | null>;
```

### Step 2: MercadoPago Client

**Create:** `src/lib/mercadopago/client.ts`

```typescript
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const preApproval = new PreApproval(client);

interface CreateSubscriptionParams {
  reason: string;
  externalReference: string;
  payerEmail: string;
  amount: number;
  currencyId: string;
  frequency?: number;
  frequencyType?: 'months' | 'days';
  endDate?: string;
  freeTrial?: {
    frequency: number;
    frequencyType: 'months' | 'days';
  };
}

export async function createPreApproval({
  reason,
  externalReference,
  payerEmail,
  amount,
  currencyId,
  frequency = 1,
  frequencyType = 'months',
  endDate,
  freeTrial,
}: CreateSubscriptionParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return preApproval.create({
    body: {
      reason,
      external_reference: externalReference,
      payer_email: payerEmail,
      auto_recurring: {
        frequency,
        frequency_type: frequencyType,
        transaction_amount: amount,
        currency_id: currencyId,
        ...(endDate ? { end_date: endDate } : {}),
        ...(freeTrial ? {
          free_trial: {
            frequency: freeTrial.frequency,
            frequency_type: freeTrial.frequencyType,
          },
        } : {}),
      },
      back_url: `${baseUrl}/subscription-success`, // Single URL — MP appends preapproval_id
      status: 'pending', // Redirect-based: user picks payment method on MP
    },
  });
}

export async function getPreApproval(preapprovalId: string) {
  return preApproval.get({ id: preapprovalId });
}

export async function updatePreApproval(
  preapprovalId: string,
  data: { status?: string; reason?: string; auto_recurring?: Record<string, unknown> }
) {
  return preApproval.update({
    id: preapprovalId,
    body: data as any,
  });
}
```

### Step 3: Subscribe API Route

**Create:** `src/app/api/subscribe/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createSubscription, updateSubscription } from '@/lib/db/subscriptions';
import { createPreApproval } from '@/lib/mercadopago/client';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email(),
  reason: z.string().min(1).default('Suscripción'),
  amount: z.number().positive(),
  currency_id: z.string().default('ARS'), // Change per references/countries.md
  frequency: z.number().positive().default(1),
  frequency_type: z.enum(['months', 'days']).default('months'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { email, reason, amount, currency_id, frequency, frequency_type } = validation.data;

    // Create subscription record in DB
    const subscription = await createSubscription({
      user_email: email,
      reason,
      status: 'pending',
      amount,
      currency_id,
      frequency,
      frequency_type,
    });

    // Create preapproval in MercadoPago
    const mpPreApproval = await createPreApproval({
      reason,
      externalReference: subscription.id,
      payerEmail: email,
      amount,
      currencyId: currency_id,
      frequency,
      frequencyType: frequency_type,
    });

    // Save MP preapproval ID in DB
    await updateSubscription(subscription.id, {
      mercadopago_preapproval_id: mpPreApproval.id,
    });

    return NextResponse.json({
      preapprovalId: mpPreApproval.id,
      initPoint: mpPreApproval.init_point,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
```

### Step 4: Webhook Handler

**Create:** `src/app/api/webhooks/mercadopago/route.ts`

The webhook for subscriptions differs from Checkout Pro:
- **Topic/type**: `subscription_preapproval` (not `payment`)
- **Status to check**: `authorized` (not `approved`)
- **API call**: `PreApproval.get()` (not `Payment.get()`)

```typescript
import { NextResponse } from 'next/server';
import {
  getSubscriptionByPreapprovalId,
  getSubscriptionStatus,
  updateSubscription,
} from '@/lib/db/subscriptions';
import { getPreApproval } from '@/lib/mercadopago/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle subscription_preapproval notifications
    if (body.type !== 'subscription_preapproval') {
      return NextResponse.json({ received: true });
    }

    const preapprovalId = body.data?.id;
    if (!preapprovalId) return NextResponse.json({ received: true });

    // Fetch full preapproval details from MercadoPago
    const preapproval = await getPreApproval(preapprovalId.toString());
    if (!preapproval) return NextResponse.json({ received: true });

    // Map MP status to our DB status
    let status: 'pending' | 'authorized' | 'paused' | 'cancelled' = 'pending';
    if (preapproval.status === 'authorized') status = 'authorized';
    else if (preapproval.status === 'paused') status = 'paused';
    else if (preapproval.status === 'cancelled') status = 'cancelled';

    // Find subscription by external_reference (our DB ID) or by preapproval_id
    const subscriptionId = preapproval.external_reference;
    if (!subscriptionId) {
      // Try finding by preapproval_id
      const sub = await getSubscriptionByPreapprovalId(preapprovalId.toString());
      if (!sub) return NextResponse.json({ received: true });

      // Idempotency: skip if already in terminal state
      if (sub.status === 'cancelled') {
        return NextResponse.json({ received: true });
      }

      await updateSubscription(sub.id, {
        status,
        mercadopago_payer_id: preapproval.payer_id?.toString(),
        next_payment_date: preapproval.next_payment_date,
        updated_at: new Date().toISOString(),
      });

      return NextResponse.json({ received: true });
    }

    // Idempotency: skip if already cancelled
    const existing = await getSubscriptionStatus(subscriptionId);
    if (existing?.status === 'cancelled') {
      return NextResponse.json({ received: true });
    }

    await updateSubscription(subscriptionId, {
      status,
      mercadopago_preapproval_id: preapprovalId.toString(),
      mercadopago_payer_id: preapproval.payer_id?.toString(),
      next_payment_date: preapproval.next_payment_date,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent MercadoPago from retrying indefinitely
    return NextResponse.json({ received: true });
  }
}

// GET endpoint for MercadoPago verification pings
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

### Step 5: Subscription Status API

**Create:** `src/app/api/subscriptions/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSubscriptionStatus } from '@/lib/db/subscriptions';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getSubscriptionStatus(id);

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ id: data.id, status: data.status });
}
```

### Step 6: Subscribe Hook (Frontend)

**Create:** `src/hooks/useSubscribe.ts`

```typescript
'use client';
import { useCallback, useRef, useState } from 'react';

interface SubscribeParams {
  email: string;
  reason?: string;
  amount: number;
  currency_id?: string;
  frequency?: number;
  frequency_type?: 'months' | 'days';
}

export function useSubscribe() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guard = useRef(false);

  const submitSubscription = useCallback(async (params: SubscribeParams) => {
    if (guard.current) return;
    setError(null);
    guard.current = true;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      if (data.initPoint) window.location.href = data.initPoint;
      else throw new Error('No subscription link returned');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsSubmitting(false);
      guard.current = false;
    }
  }, []);

  return { submitSubscription, isSubmitting, error };
}
```

### Step 7: Success Page with Verification

**Create:** `src/app/subscription-success/page.tsx` (adjust route name)

MercadoPago appends `preapproval_id` to the `back_url` after the user authorizes.
Always verify subscription status server-side. Never trust the redirect URL alone.

```tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

type Status = 'loading' | 'authorized' | 'pending' | 'cancelled' | 'error';

function SubscriptionResult() {
  const preapprovalId = useSearchParams().get('preapproval_id');
  const [status, setStatus] = useState<Status>(preapprovalId ? 'loading' : 'authorized');

  const verify = useCallback(async (id: string) => {
    try {
      // Fetch preapproval status from MP via our API
      const res = await fetch(`/api/subscriptions/verify?preapproval_id=${id}`);
      if (!res.ok) { setStatus('error'); return; }
      const data = await res.json();
      if (data.status === 'authorized') setStatus('authorized');
      else if (data.status === 'pending') setStatus('pending');
      else if (data.status === 'cancelled') setStatus('cancelled');
      else setStatus('pending'); // Default to pending if unknown
    } catch { setStatus('error'); }
  }, []);

  useEffect(() => { if (preapprovalId) verify(preapprovalId); }, [preapprovalId, verify]);

  if (status === 'loading') {
    return <div>Verifying subscription...</div>;
  }

  if (status === 'authorized') {
    return (
      <div>
        <h1>Subscription Active!</h1>
        <p>Thank you for subscribing. Your recurring payments have been set up.</p>
        <p>You will be charged automatically according to your plan.</p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div>
        <h1>Subscription Pending</h1>
        <p>Your subscription is being processed.</p>
        <p>You'll receive an email confirmation when the payment is authorized.</p>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div>
        <h1>Subscription Cancelled</h1>
        <p>Your subscription was not completed.</p>
        <p>Please try again or contact support.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Error</h1>
      <p>Could not verify subscription status. Please contact support.</p>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return <Suspense fallback={<div>Loading...</div>}><SubscriptionResult /></Suspense>;
}
```

### Step 8: Verify Subscription API (for success page)

**Create:** `src/app/api/subscriptions/verify/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getPreApproval } from '@/lib/mercadopago/client';
import { getSubscriptionByPreapprovalId, updateSubscription } from '@/lib/db/subscriptions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preapprovalId = searchParams.get('preapproval_id');

  if (!preapprovalId) {
    return NextResponse.json({ error: 'Missing preapproval_id' }, { status: 400 });
  }

  try {
    // Fetch latest status from MercadoPago
    const preapproval = await getPreApproval(preapprovalId);

    // Also update our DB if we find the subscription
    const sub = await getSubscriptionByPreapprovalId(preapprovalId);
    if (sub && preapproval.status) {
      let dbStatus: 'pending' | 'authorized' | 'paused' | 'cancelled' = 'pending';
      if (preapproval.status === 'authorized') dbStatus = 'authorized';
      else if (preapproval.status === 'paused') dbStatus = 'paused';
      else if (preapproval.status === 'cancelled') dbStatus = 'cancelled';

      await updateSubscription(sub.id, {
        status: dbStatus,
        next_payment_date: preapproval.next_payment_date,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: preapproval.status,
      reason: preapproval.reason,
      next_payment_date: preapproval.next_payment_date,
    });
  } catch (error) {
    console.error('Verify subscription error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
```

### Step 9 (Optional): Subscription Management API

**Create:** `src/app/api/subscriptions/[id]/manage/route.ts`

For pausing, cancelling, or reactivating subscriptions:

```typescript
import { NextResponse } from 'next/server';
import { getSubscriptionStatus, updateSubscription } from '@/lib/db/subscriptions';
import { updatePreApproval } from '@/lib/mercadopago/client';
import { z } from 'zod';

const manageSchema = z.object({
  action: z.enum(['pause', 'cancel', 'reactivate']),
  mercadopago_preapproval_id: z.string(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const validation = manageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { action, mercadopago_preapproval_id } = validation.data;

    // Map action to MercadoPago status
    const statusMap = {
      pause: 'paused',
      cancel: 'cancelled',
      reactivate: 'authorized',
    } as const;

    const mpStatus = statusMap[action];

    // Update in MercadoPago
    await updatePreApproval(mercadopago_preapproval_id, {
      status: mpStatus,
    });

    // Update in our DB
    await updateSubscription(id, {
      status: mpStatus as any,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, status: mpStatus });
  } catch (error) {
    console.error('Manage subscription error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
```

## Checklist

### Configuration

- [ ] `mercadopago` + `zod` installed
- [ ] `MERCADOPAGO_ACCESS_TOKEN` in `.env` (TEST token for dev, never `NEXT_PUBLIC_`)
- [ ] `NEXT_PUBLIC_APP_URL` in `.env` (HTTPS in production)
- [ ] Database migration run (`subscriptions` table)
- [ ] Webhook configured in MP Developer Panel (topics: `subscription_preapproval` + `payments`)

### Backend Implementation

- [ ] DB helper implemented (`src/lib/db/subscriptions.ts`)
- [ ] MercadoPago client with `createPreApproval`, `getPreApproval`, and `updatePreApproval`
- [ ] `/api/subscribe` with Zod validation
- [ ] `/api/webhooks/mercadopago` handling `subscription_preapproval` events
- [ ] `/api/subscriptions/[id]` for status check
- [ ] `/api/subscriptions/verify` for success page verification

### Frontend Implementation

- [ ] Subscribe hook with `useRef` guard (prevents double submit)
- [ ] Success page verifies status via API (not trusting redirect)
- [ ] Pending status UI for unconfirmed subscriptions
- [ ] `useSearchParams` wrapped in `<Suspense>`

### Production Readiness

- [ ] `NEXT_PUBLIC_APP_URL` uses HTTPS
- [ ] Webhook URL publicly accessible
- [ ] Production credentials (not TEST-)
- [ ] Subscription management UI (pause/cancel)
- [ ] Error logging configured

### Optional Features

- [ ] Subscription management API (pause, cancel, reactivate)
- [ ] Free trial period configuration
- [ ] Billing day and proration setup
- [ ] Active subscription check (prevent duplicate subscriptions)

## Critical Gotchas

For detailed solutions, see `references/troubleshooting.md`.

| Gotcha | Fix |
|--------|-----|
| Webhook type is `subscription_preapproval`, NOT `payment` | Check `body.type === 'subscription_preapproval'` |
| Active status is `authorized`, NOT `approved` | Map `authorized` → active subscription |
| `back_url` is a single URL (not `back_urls` like Checkout Pro) | Use one URL, MP appends `preapproval_id` as query param |
| `status: 'pending'` in creation = redirect flow | Set `status: 'pending'` to get `init_point` for redirect |
| `PreApproval` class, NOT `Preference` | Import `{ PreApproval }` from `mercadopago` |
| Configure webhook topics in Developer Panel | Must activate `subscription_preapproval` + `payments` topics |
| MP retries cancelled subscriptions after 3 failed installments | Handle automatic cancellation in webhook |
| `currency_id` must match account country | Same as Checkout Pro — see `references/countries.md` |
| Double subscription on double-click | Use `useRef` guard, not just `useState` |
| `useSearchParams` error | Wrap component in `<Suspense>` |
| Free trial only works with `frequency_type: 'months'` | Cannot use free trial with daily frequency |
| Proration only for monthly frequency with `billing_day` | Set `billing_day_proportional: true` on plan |

## Subscription vs Checkout Pro — Key Differences

| Aspect | Checkout Pro | Subscriptions |
|--------|-------------|---------------|
| API endpoint | `/checkout/preferences` | `/preapproval` |
| SDK class | `Preference` | `PreApproval` |
| Return URL | `back_urls` (success/failure/pending) | `back_url` (single URL) |
| Active status | `approved` | `authorized` |
| Webhook type | `payment` | `subscription_preapproval` |
| Webhook action | `payment.created` / `payment.updated` | N/A (uses `type` field) |
| Payment ID field | `data.id` → Payment ID | `data.id` → Preapproval ID |
| Items | Array of items with quantity/price | Single `auto_recurring` config |
| `auto_return` | Available (HTTPS only) | Not applicable |
| Expiration | `expiration_date_from/to` | `end_date` in `auto_recurring` |
| `external_reference` | Set in preference body | Set in preapproval body |

## References

### Database Adapters
- `references/database-supabase.md` - Supabase DB helper implementation
- `references/database-prisma.md` - Prisma DB helper implementation
- `references/database-postgresql.md` - Raw PostgreSQL (pg, Drizzle, etc.) DB helper implementation

### Configuration
- `references/countries.md` - Currencies, test cards, payment methods by country
- `references/testing.md` - Testing guide for subscriptions
- `references/subscription-management.md` - Pause, cancel, reactivate, modify subscriptions

### Help
- `references/troubleshooting.md` - Common errors and solutions
- `references/usage-examples.md` - Ready-to-use prompt templates

### Assets
- `assets/migration.sql` - Database schema template (standard PostgreSQL)

### External Links
- [MercadoPago Subscriptions Docs](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/landing)
- [MercadoPago Node SDK](https://github.com/mercadopago/sdk-nodejs)
- [Subscriptions API Reference](https://www.mercadopago.com.ar/developers/en/reference/subscriptions/_preapproval/post)
- [Developer Panel](https://www.mercadopago.com/developers/panel/app)
