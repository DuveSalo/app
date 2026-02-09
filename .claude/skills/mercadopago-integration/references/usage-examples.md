# Usage Examples - Subscriptions

Copy and adapt these prompts when asking Claude to integrate MercadoPago Subscriptions.

## Quick Start

### Minimal Prompt (Claude Explores First)

```
Integrar suscripciones de MercadoPago en mi app
```

or in English:

```
Integrate MercadoPago Subscriptions using the mercadopago-subscriptions skill.
Explore my codebase first to find the user model, database setup,
and existing routes before implementing.
```

Claude will automatically:
1. Detect your database (Supabase/Prisma/pg)
2. Identify existing routes
3. Determine currency from country context
4. Implement the full integration

---

## Full Integration Examples

### Supabase

```
Integrate MercadoPago Subscriptions following the mercadopago-subscriptions skill.

Details:
- Database: Supabase
- Currency: ARS
- Plan: "Plan Premium" - $5000/month
- Success route: /suscripcion-exitosa
- Supabase server client: src/lib/supabase/server.ts (createServiceClient)

Run the migration, create all files, and add env vars to .env.example.
```

### Prisma

```
Integrate MercadoPago Subscriptions following the mercadopago-subscriptions skill.

Details:
- Database: PostgreSQL via Prisma
- Currency: BRL
- Plan: "Plano Pro" - R$49.90/month
- Success route: /assinatura-sucesso
- Prisma client: src/lib/prisma.ts

Use the Prisma database reference for the DB helper.
```

### Raw PostgreSQL / Neon

```
Integrate MercadoPago Subscriptions following the mercadopago-subscriptions skill.

Details:
- Database: PostgreSQL (Neon) with raw pg driver
- Currency: MXN
- Plan: "Plan Mensual" - $299/month
- Success route: /suscripcion-exitosa
```

---

## Specific Subscription Types

### Monthly Subscription

```
Integrate MercadoPago Subscriptions for a monthly plan.
Currency: ARS. Amount: $5000/month. No end date.
Follow the mercadopago-subscriptions skill.
```

### Annual Subscription (Monthly Charges)

```
Integrate MercadoPago Subscriptions with monthly charges for 12 months.
Currency: ARS. Amount: $4000/month. End date: 12 months from start.
Follow the mercadopago-subscriptions skill.
```

### Subscription with Free Trial

```
Integrate MercadoPago Subscriptions with a 7-day free trial.
Currency: BRL. Amount: R$29.90/month after trial.
Follow the mercadopago-subscriptions skill.
```

### Subscription with Billing Day

```
Integrate MercadoPago Subscriptions with billing on the 10th of each month.
Include proration for the first payment.
Currency: ARS. Amount: $5000/month.
Follow the mercadopago-subscriptions skill.
```

---

## Country-Specific Integration

### Argentina

```
Integrate MercadoPago Subscriptions for an Argentine app.
Currency: ARS. Amount: $5000/month.
Follow the mercadopago-subscriptions skill.
```

### Brazil

```
Integrate MercadoPago Subscriptions for a Brazilian app.
Currency: BRL. Amount: R$49.90/month.
Follow the mercadopago-subscriptions skill.
```

### Mexico

```
Integrate MercadoPago Subscriptions for a Mexican app.
Currency: MXN. Amount: $299/month.
Follow the mercadopago-subscriptions skill.
```

---

## Add Features

### Add Subscription Management

```
I already have MercadoPago subscriptions working but I need to add
pause/cancel/reactivate functionality.
Follow the mercadopago-subscriptions skill for the management API.
```

### Add Webhook Handler

```
I already have MercadoPago subscription creation working but I need
to add the webhook handler for subscription_preapproval events.
Follow the mercadopago-subscriptions skill.
```

### Add Active Subscription Check

```
Add a check to prevent users from creating duplicate subscriptions.
Before creating a new subscription, verify if the user already has
an active one. Follow the mercadopago-subscriptions skill.
```

### Add Subscription Status Page

```
Create a subscription management page where users can see their
subscription status and pause/cancel it.
Follow the mercadopago-subscriptions skill.
```

---

## Troubleshooting Prompts

### Webhook Not Receiving

```
My subscription webhook at /api/webhooks/mercadopago isn't receiving
notifications. I'm testing on [localhost / production URL].
Diagnose using the mercadopago-subscriptions skill.
```

### Wrong Status Mapping

```
My subscriptions are created but the status never updates from pending.
Check my webhook and status mapping following the mercadopago-subscriptions skill.
```

### init_point Not Returned

```
The MercadoPago API returns a subscription but init_point is null.
Fix using the mercadopago-subscriptions skill troubleshooting guide.
```

---

## Production Deployment

### Pre-Production Checklist

```
Review my MercadoPago subscription integration for production readiness
using the mercadopago-subscriptions skill checklist. Check:
- HTTPS URLs
- Production credentials
- Webhook configuration in Developer Panel
- Error handling
```

### Switch to Production

```
My MercadoPago subscriptions work in test mode. Help me switch to
production credentials following the mercadopago-subscriptions skill.
My production URL is https://myapp.com
```
