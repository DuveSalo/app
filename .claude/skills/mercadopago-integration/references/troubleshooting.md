# MercadoPago Subscriptions - Troubleshooting

## Table of Contents

### Configuration Errors
1. [Invalid Token (401)](#invalid-token)
2. [Currency mismatch](#currency-mismatch)
3. [Webhook not configured](#webhook-not-configured)

### Subscription Creation Errors
4. [Invalid payer_email](#invalid-payer-email)
5. [Transaction amount too small](#transaction-amount-too-small)
6. [init_point not returned](#init-point-not-returned)
7. [Invalid frequency configuration](#invalid-frequency)

### Frontend Errors
8. [Hydration mismatch](#hydration-mismatch)
9. [Double subscription on double-click](#double-subscription)
10. [useSearchParams error in App Router](#usesearchparams-error)

### Webhook Errors
11. [Webhook not received locally](#webhook-not-received)
12. [Wrong webhook type filter](#wrong-webhook-type)
13. [Webhook duplicate notifications](#webhook-duplicates)

### Status / Flow Errors
14. [Subscription stuck in pending](#stuck-in-pending)
15. [Success page shows wrong status](#success-page-status)
16. [Using Preference instead of PreApproval](#wrong-sdk-class)
17. [Invalid users involved](#invalid-users)
18. [Generic error "Ops, ocorreu um erro"](#generic-error)

### Environment Errors
19. [Mixed test/production credentials](#mixed-credentials)
20. [Node.js version incompatible](#node-version)

---

## Invalid Token (401) {#invalid-token}

**Error:** HTTP 401 Unauthorized

**Cause:** Access token is expired, invalid, or doesn't have required permissions.

**Fix:**
1. Verify token is correct (no extra spaces)
2. Regenerate from [Developer Panel](https://www.mercadopago.com/developers/panel/app)
3. Ensure you're using the correct environment (TEST vs production)

```bash
curl -X GET \
  "https://api.mercadopago.com/v1/payment_methods" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Currency mismatch {#currency-mismatch}

**Error:** 400 Bad Request when creating preapproval

**Cause:** The `currency_id` in `auto_recurring` doesn't match the country of your MercadoPago account.

**Fix:** Use the correct currency for your account's country:

| Country | currency_id |
|---------|-------------|
| Argentina | `ARS` |
| Brazil | `BRL` |
| Mexico | `MXN` |
| Colombia | `COP` |
| Chile | `CLP` |
| Peru | `PEN` |
| Uruguay | `UYU` |

---

## Webhook not configured {#webhook-not-configured}

**Error:** Webhooks not arriving despite correct endpoint

**Cause:** Unlike Checkout Pro (where `notification_url` is set per preference), subscriptions require webhook configuration **in the Developer Panel**.

**Fix:**
1. Go to Developer Panel → Your application → Webhooks
2. Set the webhook URL
3. Select topics: **Planes y Suscripciones** + **Pagos**
4. Save configuration

---

## Invalid payer_email {#invalid-payer-email}

**Error:** 400 when creating preapproval

**Cause:** `payer_email` is empty, malformed, or belongs to the seller account.

**Fix:**
1. Validate email with Zod before calling MP API
2. Ensure the email is the **buyer's** email, not the seller's
3. In testing, use a test buyer email

---

## Transaction amount too small {#transaction-amount-too-small}

**Error:** `The value for transaction_amount is too small`

**Cause:** MercadoPago has minimum amounts for subscriptions (varies by country).

**Fix:** Ensure subscription amount meets minimum requirements. See `references/countries.md` for approximate minimums per country.

---

## init_point not returned {#init-point-not-returned}

**Error:** `init_point` is `undefined` or `null` in the preapproval response

**Cause:** When creating a subscription with `status: 'authorized'` (not `'pending'`), MercadoPago may not return `init_point` because a redirect is not needed.

**Fix:** For redirect-based flow, always use `status: 'pending'`:

```typescript
// ✅ Correct - redirect flow
status: 'pending'

// ❌ Wrong for redirect flow - requires card_token_id
status: 'authorized'
```

---

## Invalid frequency configuration {#invalid-frequency}

**Error:** 400 when creating preapproval with invalid frequency

**Cause:** Invalid combination of `frequency` and `frequency_type`.

**Fix:**
- `frequency_type` must be `'months'` or `'days'`
- `frequency` must be a positive integer
- Free trial requires `frequency_type: 'months'` and `frequency: 1`
- Proration (`billing_day_proportional`) only works with monthly frequency

---

## Hydration mismatch {#hydration-mismatch}

**Error:** React hydration mismatch warning on subscription page

**Cause:** Using `localStorage` for user state. Server has no access to `localStorage`.

**Fix:** Add a `mounted` guard:

```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

if (!mounted) return <LoadingSpinner />;
```

---

## Double subscription {#double-subscription}

**Cause:** User clicks "Subscribe" multiple times before redirect.

**Fix:** Use a `useRef` flag:

```typescript
const guard = useRef(false);

const submit = async () => {
  if (guard.current) return;
  guard.current = true;
  // ... fetch ...
  // Only reset on error (success redirects away)
};
```

Also consider checking for existing active subscriptions:

```typescript
const existing = await getUserActiveSubscription(email);
if (existing) {
  return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
}
```

---

## useSearchParams error {#usesearchparams-error}

**Error:** `useSearchParams() should be wrapped in a suspense boundary`

**Fix:**

```tsx
function SubscriptionContent() {
  const searchParams = useSearchParams();
  // ... component logic
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SubscriptionContent />
    </Suspense>
  );
}
```

---

## Webhook not received {#webhook-not-received}

**Cause:** MercadoPago cannot reach `localhost` AND/OR webhooks not configured in Developer Panel.

**Fix:**
1. **Local dev**: Use ngrok: `ngrok http 3000`
2. **Configure in Developer Panel**: Set the ngrok URL as webhook URL
3. **Select correct topics**: `Planes y Suscripciones` + `Pagos`
4. Remember: subscription webhooks are configured in the panel, not in the API request

---

## Wrong webhook type filter {#wrong-webhook-type}

**Error:** Webhook received but not processed

**Cause:** Filtering for `body.type === 'payment'` (Checkout Pro) instead of `body.type === 'subscription_preapproval'`.

**Fix:**

```typescript
// ✅ Correct for subscriptions
if (body.type === 'subscription_preapproval') {
  const preapproval = await getPreApproval(body.data.id);
  // ...
}

// ❌ Wrong - this is for Checkout Pro
if (body.type === 'payment') {
  // This handles payment notifications, not subscription status changes
}
```

**Note:** You may also want to handle `subscription_authorized_payment` for individual payment notifications within a subscription.

---

## Webhook duplicate notifications {#webhook-duplicates}

**Cause:** MercadoPago retries webhooks or sends multiple notifications for the same event.

**Fix:** Idempotency check:

```typescript
const existing = await getSubscriptionStatus(subscriptionId);
if (existing?.status === 'cancelled') {
  return NextResponse.json({ received: true });
}
```

Always return 200 to prevent infinite retries.

---

## Subscription stuck in pending {#stuck-in-pending}

**Cause:** Several possible reasons:
1. User didn't complete authorization on MercadoPago
2. Webhook not received (localhost issue or panel not configured)
3. Webhook handler has a bug

**Fix:**
- Verify webhook is configured in Developer Panel
- Use the verify API to check status directly from MP:
  ```typescript
  const preapproval = await getPreApproval(preapprovalId);
  console.log(preapproval.status); // Should be 'authorized' after user completes
  ```
- In dev, rely on the verify endpoint in the success page as a fallback

---

## Success page shows wrong status {#success-page-status}

**Cause:** Checking for `status === 'approved'` (Checkout Pro) instead of `status === 'authorized'` (Subscriptions).

**Fix:**

```typescript
// ✅ Correct for subscriptions
if (preapproval.status === 'authorized') {
  // Subscription is active
}

// ❌ Wrong - 'approved' is for Checkout Pro payments
if (preapproval.status === 'approved') {
  // This will never match for subscriptions
}
```

---

## Using Preference instead of PreApproval {#wrong-sdk-class}

**Error:** Unexpected behavior or 404 errors

**Cause:** Using `new Preference(client)` (Checkout Pro) instead of `new PreApproval(client)` (Subscriptions).

**Fix:**

```typescript
// ✅ Correct for subscriptions
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
const preApproval = new PreApproval(client);

// ❌ Wrong - this is for Checkout Pro
import { MercadoPagoConfig, Preference } from 'mercadopago';
const preference = new Preference(client);
```

---

## Invalid users involved {#invalid-users}

**Error:** `invalid users involved`

**Cause:** The buyer's email belongs to a test user while the seller's credentials are production (or vice versa).

**Fix:** Ensure consistency:
- **Testing:** Use test seller credentials + test buyer account
- **Production:** Use production credentials + real buyer accounts

---

## Generic error "Ops, ocorreu um erro" {#generic-error}

**Cause:** Common causes:
1. Mixed credentials (test/production)
2. Invalid `back_url`
3. Webhook URL unreachable
4. Invalid subscription parameters

**Fix checklist:**
- [ ] Credentials match environment (all test or all production)
- [ ] `back_url` is a valid URL
- [ ] `auto_recurring` has valid amount, currency, and frequency
- [ ] `payer_email` is valid and not the seller's email
- [ ] Currency matches account country

---

## Mixed test/production credentials {#mixed-credentials}

**Fix:**
1. **Development:** Use TEST Access Token + TEST buyer accounts
2. **Production:** Use PRODUCTION Access Token + real buyer accounts
3. Never mix them

```env
# Development
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx

# Production
MERCADOPAGO_ACCESS_TOKEN=APP-xxxx
```

---

## Node.js version incompatible {#node-version}

**Error:** Syntax errors or module not found

**Cause:** Node.js version is below 16 (SDK minimum) or below 20 (for MCP Server).

**Fix:**
```bash
node -v
nvm install 20
nvm use 20
```

---

## Quick Diagnosis Checklist

When something fails, check in this order:

1. **Credentials:** Correct token? Matches environment?
2. **SDK class:** Using `PreApproval`, not `Preference`?
3. **Status:** Creating with `status: 'pending'` for redirect flow?
4. **Currency:** Matches account country?
5. **Webhook:** Configured in Developer Panel? Correct topics? Reachable?
6. **Status mapping:** `authorized` (not `approved`) = active subscription?
7. **Logs:** Check server logs for detailed errors
8. **Dashboard:** Check MercadoPago developer dashboard for API errors
