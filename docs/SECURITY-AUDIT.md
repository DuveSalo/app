# Security Audit Report — Escuela Segura

**Date**: 2026-03-05
**Scope**: Full-stack security audit (RLS, input validation, auth, CORS, secrets, code hygiene, storage, uploads, webhooks)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| **CRITICAL** | 3 |
| **HIGH** | 12 |
| **MEDIUM** | 20 |
| **LOW** | 15+ |
| **PASS** | 20+ |

**Top 3 risks requiring immediate action:**

1. **RLS INSERT policies on `notifications` and `audit_logs` are wide open** — any anonymous user can insert arbitrary rows (missing `TO service_role` clause)
2. **Storage buckets are public** — all uploaded school compliance documents (certificates, PDFs) are publicly accessible via URL without authentication
3. **Webhook signature verification is conditional** — if `MP_WEBHOOK_SECRET` env var is not set, all signature verification is skipped

---

## 1. Row Level Security (RLS) Audit

### Summary Table

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Multi-tenant | Anon blocked | Status |
|---|---|---|---|---|---|---|---|---|
| companies | YES | YES | YES | YES | YES | YES | WEAK | **WEAK** |
| fire_extinguishers | YES | YES | YES | YES | YES | YES | WEAK | **WEAK** |
| self_protection_systems | YES | YES | YES | YES | YES | YES | WEAK | **WEAK** |
| conservation_certificates | YES | YES | YES | YES | YES | YES | WEAK | **WEAK** |
| events | YES | YES | YES | YES | YES | YES | WEAK | **WEAK** |
| employees | YES | YES | YES | YES | YES | YES | WEAK | **WEAK** |
| qr_documents | YES | YES | YES | YES | YES | YES | WEAK | **WEAK** |
| notifications | YES | YES | **OPEN** | YES | YES | PARTIAL | **NO** | **CRITICAL** |
| audit_logs | YES | YES | **OPEN** | N/A | N/A | PARTIAL | **NO** | **CRITICAL** |
| subscriptions | YES | YES | YES | svc only | svc only | YES | YES | OK |
| payment_transactions | YES | YES | svc only | svc only | svc only | YES | YES | OK |
| paypal_webhook_log | YES | svc only | svc only | svc only | svc only | N/A | YES | OK |
| mp_webhook_log | YES | svc only | svc only | svc only | svc only | N/A | YES | OK |

### CRITICAL: Notifications & Audit Logs INSERT Policies

**File**: `supabase/migrations/20250205000003_add_rls_missing_tables.sql`, lines 108-110 and 123-125

Both tables have INSERT policies with `WITH CHECK (true)` but **no `TO service_role` clause**, meaning they default to `TO public`. Any unauthenticated user can insert arbitrary rows.

```sql
-- VULNERABLE (current)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- FIX: Add TO service_role
DROP POLICY "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);
```

Same fix needed for `audit_logs`.

### MEDIUM: Missing `TO authenticated` on 7 Entity Tables

Tables: companies, fire_extinguishers, self_protection_systems, conservation_certificates, events, employees, qr_documents.

All user-facing policies default to `TO public` (all roles). While `auth.uid()` returns NULL for `anon` making queries return empty, this is defense-by-side-effect rather than defense-by-design. All policies should explicitly specify `TO authenticated`.

### Other RLS Findings

- **SECURITY DEFINER function**: `delete_user_storage_objects()` in `20250128_cascade_delete_users.sql` — LOW risk, trigger-bound, cannot be called via RPC
- **No views found** in any migration
- **Missing storage UPDATE policy** in `20250215_storage_policies.sql` — no UPDATE policy for `storage.objects`
- **Hardcoded secret** in `20250209_setup_cron_check_subscriptions.sql:14` — bearer token committed to repo (superseded by newer migration using `current_setting()`, but visible in git history — **rotate immediately**)

---

## 2. Input Validation & Sanitization

### HIGH: Cursor Pagination Injection (5 API services)

**Files**: `certificate.ts:70`, `fireExtinguisher.ts:94`, `system.ts:72`, `qr.ts:99`, `event.ts:59`

Cursor values are decoded from user-controlled base64 and interpolated directly into PostgREST `.or()` filter strings without validation. An attacker could craft a cursor to inject arbitrary filter expressions, potentially bypassing `company_id` restrictions.

**Fix**: Validate `cursorDate` with `/^\d{4}-\d{2}-\d{2}$/` and `cursorId` with UUID regex before interpolation.

### HIGH: Webhook Signature Verification Conditional

**File**: `supabase/functions/webhook-mercadopago/index.ts:242`

```typescript
// VULNERABLE: if secret not set, verification is SKIPPED
if (config.webhookSecret) { ... }

// FIX: Hard fail if secret is missing
if (!config.webhookSecret) {
  return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500 });
}
```

### ~~MEDIUM: Zod Schema Gaps~~ — FIXED

All schemas now have `.max()` limits on every text field and `.max(50)` on arrays. Date string fields validated with regex `/^\d{4}-\d{2}-\d{2}$/`. See individual `features/*/schemas.ts` files.

### ~~MEDIUM: PDF File Validation~~ — FIXED

Shared `pdfFileSchema` and `imageFileSchema` created in `lib/schemas/common.ts` with size (10MB PDF, 5MB image) and MIME type validation. Applied to conservation-certificates, qr, and self-protection-systems schemas. `FileUpload.tsx` also validates MIME type client-side with toast feedback.

### ~~MEDIUM: Edge Function Input Validation~~ — FIXED

`isValidMPId()` regex validation added to `mp-get-subscription-status`, `mp-manage-subscription`, and `webhook-mercadopago` for all client-supplied IDs. Error messages sanitized — generic Spanish messages returned to clients, details logged server-side.

### ~~MEDIUM: Email Template XSS~~ — FIXED

`escapeHtml()` utility added to `email-templates.ts`. Applied to all user-supplied data: `name` in greeting, `label`/`value` in infoRow, `item.name`/`item.type` in expiration warnings.

### No `.rpc()` Calls Found

All queries use the Supabase query builder — no raw SQL injection risk.

---

## 3. Auth, CORS, Redirects & Secrets

### HIGH: Wildcard CORS on Payment Edge Functions

**File**: `supabase/functions/_shared/cors.ts:25-28`

4 Edge Functions use the deprecated `corsHeaders` with `Access-Control-Allow-Origin: *`:
- `mp-create-subscription` — handles subscription creation with payment data
- `mp-get-subscription-status` — exposes subscription billing details
- `mp-manage-subscription` — allows plan changes, cancellation, card updates
- `webhook-mercadopago` — incoming webhooks (lower risk)

A proper `getCorsHeaders()` function with origin allowlist exists but is **unused** by these functions.

**Fix**: Migrate all Edge Functions to `getCorsHeaders(req.headers.get('origin'))` and delete the deprecated export.

### ~~MEDIUM: Auth Configuration Gaps~~ — FIXED

**File**: `supabase/config.toml`

| Setting | Status |
|---|---|
| JWT expiry | **FIXED** — `jwt_expiry = 3600` explicit |
| Refresh token rotation | **FIXED** — `enable_refresh_token_rotation = true`, `refresh_token_reuse_interval = 10` |
| Password minimum length | **FIXED** — `min_length = 8` in `[auth.password]` |
| Rate limiting on auth | **FIXED** — `max_frequency = "60s"` in `[auth.email]` |
| Email confirmation | **PASS** — `enable_confirmations = true` |
| PKCE flow | **PASS** — enabled in client |
| Double-confirm changes | **PASS** — enabled |

### ~~MEDIUM: `verify_jwt = false` on User-Facing Functions~~ — FIXED (in Critical/High phase)

`mp-get-subscription-status` and `mp-manage-subscription` now have `verify_jwt = true` in `config.toml`.

### PASS: Redirects, Secrets, Service Role

- No open redirect vulnerabilities — all redirects use hardcoded `ROUTE_PATHS` constants
- No `service_role` key in client code
- `.gitignore` covers all env files
- No hardcoded secrets in client code
- `lib/env.ts` validates all required env vars with Zod
- Only `process.env.NODE_ENV` used outside `lib/env.ts` (acceptable)

---

## 4. Code Hygiene

### Console Statements (16 occurrences)

| File | Count | Types | Concern |
|---|---|---|---|
| `CardForm.tsx` | 9 | 6 `console.log`, 3 `console.error` | **Line 158 logs token response data** — sensitive payment info |
| `NotificationBell.tsx` | 4 | 4 `console.error` | Error fetching/marking notifications — acceptable but should use structured logger |
| `BillingSection.tsx` | 1 | `console.error` | Create subscription error |
| `useSettingsData.ts` | 1 | `console.debug` | Change plan debug info |

**Priority**: Remove all 6 `console.log` in `CardForm.tsx` immediately (especially line 158 which logs payment token response).

### Dependency Audit (6 vulnerabilities)

| Severity | Package | Issue | Runtime? |
|---|---|---|---|
| HIGH | `@hono/node-server` | Auth bypass via encoded slashes | No — dev tool (shadcn CLI) |
| HIGH | `tar` | Hardlink path traversal | No — dev tool (supabase CLI) |
| HIGH | `hono` | Arbitrary file access via serveStatic | No — dev tool (shadcn CLI) |
| **moderate** | **`dompurify`** | **XSS vulnerability** | **YES — runtime dependency** |
| moderate | `hono` (2) | Cookie injection + SSE injection | No — dev tool |

**Action**: `dompurify` XSS vulnerability is the only runtime concern. No patch available for v3.x yet — monitor advisory and evaluate alternatives.

### Env Variables

All `NEXT_PUBLIC_` variables are safe: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_URL`, `MP_PUBLIC_KEY`, `LOG_LEVEL`. No leaks detected.

### TypeScript Strict Mode

- `strict: true` confirmed in `tsconfig.json`
- **Zero** `@ts-ignore` or `@ts-nocheck` comments

---

## 5. Storage, Uploads & Webhooks

### HIGH: Storage Buckets Are Public

**Files**: `qr.ts:153-157`, `certificate.ts:139-143`, `system.ts:128`

All three services use `getPublicUrl()` which only works on **public buckets**. This means uploaded school compliance documents are accessible to anyone with the URL, without authentication.

**Fix**: Change buckets to private and switch to `createSignedUrl()` with short TTL (60 seconds).

### ~~MEDIUM: File Upload Validation~~ — FIXED

| Issue | Status |
|---|---|
| File size validated client-side only (10MB) | **FIXED** — Zod schemas enforce 10MB PDF / 5MB image |
| File type validated by extension only, not MIME type | **FIXED** — MIME type checked in Zod + FileUpload.tsx |
| No MIME type validation on Supabase Storage upload calls | **FIXED** — validated before upload |
| Zod schemas don't validate file size or type | **FIXED** — shared `pdfFileSchema`/`imageFileSchema` |
| No differentiated size limit (images vs PDFs) | **FIXED** — 10MB PDF, 5MB images |
| Old files not deleted on replacement (orphaned files) | **FIXED** — cleanup in certificate.ts and qr.ts |

### ~~MEDIUM: Webhook Issues~~ — FIXED (in Critical/High phase)

| Issue | Status |
|---|---|
| No HTTP method restriction | **FIXED** — POST-only with 405 for others |
| Body parsed before signature verification | **FIXED** — signature verified first |
| Uses deprecated wildcard CORS headers | **FIXED** — migrated to `getCorsHeaders()` |

### HIGH: No Rate Limiting

No Edge Function implements rate limiting. Recommended limits:

| Function | Limit |
|---|---|
| `webhook-mercadopago` | 100 req/min per IP |
| `mp-create-subscription` | 5 req/min per user |
| `mp-manage-subscription` | 10 req/min per user |
| `mp-get-subscription-status` | 20 req/min per user |
| `send-expiration-emails` | 1 req/min (CRON only) |
| `cron-check-subscriptions` | 1 req/min (CRON only) |

**Implementation**: Use Upstash Redis rate limiting or a dedicated `rate_limits` table.

### ~~MEDIUM: Missing Defense-in-Depth in API Services~~ — FIXED

All `getById` and `update` functions across all 5 API services (qr, certificate, event, fireExtinguisher, system) now include `.eq('company_id', companyId)` filters in addition to RLS.

---

## Priority Action Plan

### Immediate (CRITICAL — fix this week)

1. **Fix `notifications` and `audit_logs` INSERT policies** — add `TO service_role`
2. **Make storage buckets private** — switch from `getPublicUrl()` to `createSignedUrl()`
3. **Make webhook signature verification mandatory** — fail if `MP_WEBHOOK_SECRET` not set
4. **Rotate hardcoded secret** from migration `20250209_setup_cron_check_subscriptions.sql`

### Short-Term (HIGH — fix within 2 weeks)

5. **Fix cursor pagination injection** — validate cursor values before interpolation in all 5 API services
6. **Migrate Edge Functions to `getCorsHeaders()`** — remove wildcard CORS from payment functions
7. **Remove `console.log` from `CardForm.tsx`** — especially line 158 (token response)
8. **Add `TO authenticated` to all user-facing RLS policies** — explicit role restriction on 7 entity tables
9. **Set `verify_jwt = true`** for `mp-get-subscription-status` and `mp-manage-subscription`

### Medium-Term (MEDIUM — fix within 1 month)

10. ~~**Add `.max()` limits to all Zod text fields**~~ — **FIXED**
11. ~~**Add MIME type validation** to `FileUpload.tsx` and Zod schemas~~ — **FIXED**
12. ~~**Add explicit auth settings** to `supabase/config.toml`~~ — **FIXED**
13. ~~**Add HTML escaping** to email templates~~ — **FIXED**
14. ~~**Validate `mpPreapprovalId`/`dataId` format** in Edge Functions~~ — **FIXED**
15. ~~**Add HTTP method enforcement** to webhook handler~~ — **FIXED** (in Critical/High phase)
16. **Add rate limiting** to Edge Functions — **DOCUMENTED** in `docs/RATE-LIMITING.md` (requires Upstash Redis infrastructure)

### Nice-to-Have (LOW)

17. ~~Delete old files from storage on replacement~~ — **FIXED** (certificate.ts, qr.ts)
18. ~~Add `company_id` filters to API service queries for defense-in-depth~~ — **FIXED** (all 5 services)
19. Replace `console.error` in NotificationBell with structured logger
20. ~~Add date format validation to Zod date fields~~ — **FIXED**
21. Add `Access-Control-Allow-Methods` to CORS headers
22. Monitor `dompurify` XSS advisory — evaluate alternatives if no patch

---

## What's Working Well

- PKCE auth flow with anon key only in client
- Multi-tenant RLS with company_id chain on all entity tables
- No service_role key in client code
- No open redirect vulnerabilities
- Zod-validated environment variables
- TypeScript strict mode with zero suppressions
- No `@ts-ignore` or `@ts-nocheck` anywhere
- Webhook idempotency with `mp_webhook_log` table
- CRON functions properly verify service_role key
- No raw SQL or `.rpc()` calls in client code
- `.gitignore` covers all env files
