# MercadoPago Subscriptions - Testing Guide

## Test Accounts

Before testing, you need test credentials from your MercadoPago developer panel.

### Creating Test Accounts

1. Go to **Your integrations > Your application > Test accounts**
2. Create both a **test seller** and **test buyer** account
3. Each account has: username, password, and 6-digit email verification code

### Important Rules

- **Never mix credentials**: Test seller credentials must be used with test buyer accounts
- **Use incognito mode**: Avoids credential caching errors between test sessions
- **Separate browsers**: Use different browsers or profiles for seller vs buyer

## Webhook Configuration for Testing

Unlike Checkout Pro (where you can set `notification_url` per preference), subscription webhooks **must be configured in the Developer Panel**:

1. Go to **Your integrations > Your application > Webhooks**
2. Select environment: **Test mode** or **Production mode**
3. Enter webhook URL: `https://your-ngrok-url.ngrok-free.app/api/webhooks/mercadopago`
4. Select events: **Planes y Suscripciones** + **Pagos**
5. Click **Save**

### Simulating Notifications

You can test your webhook from the Developer Panel:
1. Go to **Webhooks > Simulate notification**
2. Select event type: **Planes y Suscripciones**
3. Enter a test Data ID
4. Click **Simulate**

## Test Cards

All test cards use:
- **CVV**: `123` (or `1234` for American Express)
- **Expiration**: `11/30`
- **Document**: Any valid format for the country (DNI, CPF, etc.)

### Simulating Subscription Results

When the user is redirected to MercadoPago to authorize the subscription, they will use a test buyer account and test card to complete the payment authorization.

The **cardholder name** determines the payment outcome:

| Name | Result | Use Case |
|------|--------|----------|
| `APRO` | Approved/Authorized | Happy path — subscription becomes `authorized` |
| `OTHE` | General error | Generic decline handling |
| `FUND` | Insufficient funds | Card declined |
| `SECU` | Invalid security code | CVV error handling |
| `EXPI` | Expired card | Expiration error handling |

### Test Cards by Country

See `references/countries.md` for the full list of test cards per country.

### Argentina (ARS) - Quick Reference

| Card | Number |
|------|--------|
| Visa | 4509 9535 6623 3704 |
| Mastercard | 5031 7557 3453 0604 |
| American Express | 3711 803032 57522 |

## Testing Flow

### 1. Create Subscription

```typescript
// POST /api/subscribe
{
  "email": "test_user_buyer@testuser.com",
  "reason": "Plan Premium",
  "amount": 5000,
  "currency_id": "ARS",
  "frequency": 1,
  "frequency_type": "months"
}
```

### 2. Redirect to MercadoPago

The API returns `initPoint` — redirect the user there. They will:
1. Log in with the **test buyer** account
2. Enter test card details (use `APRO` as cardholder name)
3. Authorize the subscription

### 3. Verify Webhook

After authorization, MercadoPago sends a webhook:
```json
{
  "type": "subscription_preapproval",
  "data": {
    "id": "preapproval_id_here"
  }
}
```

Your webhook handler fetches the preapproval details and updates the DB status to `authorized`.

### 4. Verify in Success Page

The user is redirected back to your `back_url` with `?preapproval_id=...`. The success page fetches the status and shows the appropriate UI.

## Testing Webhooks Locally

MercadoPago webhooks require a publicly accessible URL.

### Option 1: ngrok (Recommended)

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Use the HTTPS URL in Developer Panel webhook config
# https://abc123.ngrok-free.app/api/webhooks/mercadopago
```

**Important**: Update the webhook URL in Developer Panel every time ngrok restarts (URL changes).

### Option 2: localtunnel

```bash
npx localtunnel --port 3000
```

### Option 3: Skip Webhooks in Dev

For local testing, you can rely on the redirect + verify flow:
1. Subscription is created and user is redirected
2. User authorizes on MercadoPago
3. User returns to success page
4. Success page calls `/api/subscriptions/verify` which fetches status from MP API directly

This works for development but webhooks are required for production to handle:
- Automatic payment collection notifications
- Subscription cancellation after failed payments
- Status changes initiated from MercadoPago dashboard

## Testing Checklist

- [ ] Test accounts created (seller + buyer)
- [ ] Using incognito/private browsing
- [ ] Webhook configured in Developer Panel (test mode)
- [ ] Test card with `APRO` name for authorized flow
- [ ] Test card with `FUND` name for failed authorization
- [ ] Webhook receiving `subscription_preapproval` notifications
- [ ] Success page correctly shows subscription status
- [ ] Subscription management works (pause/cancel)
- [ ] Verify idempotency: webhook handles duplicate notifications

## Testing Subscription Lifecycle

### Test Pause

```bash
curl -X PUT \
  "https://api.mercadopago.com/preapproval/PREAPPROVAL_ID" \
  -H "Authorization: Bearer TEST_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "paused"}'
```

### Test Cancel

```bash
curl -X PUT \
  "https://api.mercadopago.com/preapproval/PREAPPROVAL_ID" \
  -H "Authorization: Bearer TEST_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "cancelled"}'
```

### Test Reactivate

```bash
curl -X PUT \
  "https://api.mercadopago.com/preapproval/PREAPPROVAL_ID" \
  -H "Authorization: Bearer TEST_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "authorized"}'
```

## Common Testing Issues

### Subscription Not Created

1. Verify `MERCADOPAGO_ACCESS_TOKEN` is correct
2. Check `currency_id` matches your account country
3. Ensure `payer_email` is a valid test buyer email
4. Check amount meets minimum for the country

### Webhook Not Triggering

1. Verify webhook is configured in Developer Panel (not just in code)
2. Check ngrok is running and URL matches
3. Ensure webhook endpoint returns 200
4. Verify you selected **Planes y Suscripciones** topic

### "Invalid users involved"

Mixed test/production credentials. Use test seller credentials + test buyer account.

## References

- [Official Subscriptions Docs](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/landing)
- [Subscriptions API Reference](https://www.mercadopago.com.ar/developers/en/reference/subscriptions/_preapproval/post)
- [Test Accounts Guide](https://www.mercadopago.com/developers/en/docs/checkout-pro/integration-test/test-purchases)
