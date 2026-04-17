# Security Audit

## Current billing model

Escuela Segura uses bank-transfer-only billing. Payment records live in `manual_payments`; admins approve or reject receipts through RPCs that enforce server-side admin checks and write activity logs/notifications.

## Sensitive credentials

- Browser-exposed Vercel variables must be limited to public Supabase/app configuration.
- Supabase secret keys, Resend keys, cron secrets, and any admin/service credentials stay in Supabase/Vercel private secret stores only.
- Never log tokens, private keys, receipt signed URLs, or PII beyond the minimum needed for debugging.

## Payment access rules

- `manual_payments` is the active payment ledger for bank transfers.
- Receipt files live in the private `receipts` bucket and are accessed through short-lived signed URLs.
- Admin approval sets the payment approved, activates/extends the subscription, updates company access state, logs activity, and notifies the company.
- Admin rejection sets the payment rejected, marks the company as rejected/unsubscribed, suspends any active bank-transfer subscription, logs activity, and notifies the company.
- The subscription cron suspends active bank-transfer subscriptions whose paid period is overdue.

## RLS expectations

| Table | User access | Admin access | Service role |
| --- | --- | --- | --- |
| `companies` | own company | read/update for admin workflows | full |
| `manual_payments` | own company records | review/read all | full |
| `subscriptions` | own company subscription | read/update for admin workflows | full |
| `activity_logs` | no direct user write | read/write admin actions | full |
| `notifications` | own company/user notifications | insert for admin workflows | full |

## Required checks for billing changes

1. RPCs that change payment/subscription state must verify admin role or company ownership server-side.
2. UI guards are not security boundaries; RLS/RPC checks are mandatory.
3. Payment history must not fall back to card/external-provider transaction sources.
4. Rejected/overdue states must block app access except allowed renewal/status paths.
5. Run typecheck, focused tests, full unit suite, production audit, and `git diff --check` before release. Do not run build in this project workflow.
