# MercadoPago Subscriptions - Management Guide

## Subscription Lifecycle

```
pending ──→ authorized ──→ paused ──→ authorized (reactivated)
   │              │                        │
   │              └──→ cancelled            └──→ cancelled
   └──→ cancelled
```

## Managing Subscriptions via API

All management operations use `PUT /preapproval/{id}`.

### Pause a Subscription

Temporarily stop payments. Can be reactivated later.

```typescript
await updatePreApproval(preapprovalId, {
  status: 'paused',
});
```

### Cancel a Subscription

Permanently stop the subscription. Cannot be reactivated.

```typescript
await updatePreApproval(preapprovalId, {
  status: 'cancelled',
});
```

### Reactivate a Paused Subscription

Resume a paused subscription.

```typescript
await updatePreApproval(preapprovalId, {
  status: 'authorized',
});
```

### Modify Subscription Amount

Change the recurring amount for an existing subscription.

```typescript
await updatePreApproval(preapprovalId, {
  auto_recurring: {
    transaction_amount: 7500, // New amount
    currency_id: 'ARS',
  },
});
```

### Change Billing Day

For monthly subscriptions, change the day of the month when payment is collected.

```typescript
await updatePreApproval(preapprovalId, {
  auto_recurring: {
    billing_day: 15, // 1-28
  },
});
```

## Search Subscriptions

Find subscriptions using various filters:

```bash
# Search by payer email
curl -X GET \
  "https://api.mercadopago.com/preapproval/search?payer_email=user@example.com" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search by status
curl -X GET \
  "https://api.mercadopago.com/preapproval/search?status=authorized" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search by external reference
curl -X GET \
  "https://api.mercadopago.com/preapproval/search?external_reference=SUB-123" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Automatic Cancellation

MercadoPago automatically cancels a subscription after **3 consecutive installments with rejected payments**. The seller is notified via email.

### Payment Retry Logic

When a payment fails:
1. MP retries up to **4 times** within a 10-day window
2. If still failing, the installment is marked as `processed` with a rejected payment
3. After 3 such installments, the subscription is `cancelled`

## Free Trial

Configure a free trial period before the first charge:

```typescript
auto_recurring: {
  frequency: 1,
  frequency_type: 'months',
  transaction_amount: 5000,
  currency_id: 'ARS',
  free_trial: {
    frequency: 7,        // Trial length
    frequency_type: 'days', // Trial unit
  },
},
```

**Important:** Free trial is only available for subscriptions with `frequency_type: 'months'`.

## Proration (Billing Day Proportional)

When a subscription starts on a day different from the billing day, you can charge a proportional amount for the first period:

```typescript
// Only available through preapproval_plan
auto_recurring: {
  frequency: 1,
  frequency_type: 'months',
  billing_day: 10,
  billing_day_proportional: true,
  transaction_amount: 5000,
  currency_id: 'ARS',
},
```

**Important:** Proration is only available for monthly subscriptions (`frequency: 1`, `frequency_type: 'months'`).

## Subscription Response Fields

Key fields in a preapproval response:

| Field | Description |
|-------|-------------|
| `id` | Preapproval ID |
| `status` | `pending`, `authorized`, `paused`, `cancelled` |
| `reason` | Description shown to subscriber |
| `external_reference` | Your internal reference (e.g., DB subscription ID) |
| `init_point` | URL to redirect user for authorization |
| `payer_id` | MercadoPago buyer ID |
| `payer_email` | Buyer's email |
| `next_payment_date` | Next scheduled payment date |
| `auto_recurring.transaction_amount` | Amount per period |
| `auto_recurring.frequency` | How often to charge |
| `auto_recurring.frequency_type` | `months` or `days` |
| `auto_recurring.end_date` | When the subscription ends (null = indefinite) |
| `auto_recurring.free_trial` | Free trial configuration |
| `summarized.quotas` | Total installments |
| `summarized.charged_quantity` | Installments charged |
| `summarized.charged_amount` | Total amount charged |
| `date_created` | When subscription was created |
| `last_modified` | Last modification date |
