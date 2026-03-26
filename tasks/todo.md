# Plan: System Design Improvements — Escuela Segura

## Sesión 1 (completado)

- [x] Circuit breaker + jitter en `mpFetch()` — `supabase/functions/_shared/mp-auth.ts`
- [x] UNIQUE constraint `(company_id, mp_preapproval_id)` — nueva migración SQL
- [x] Logger mejorado con traceId, `createRequestLogger`, `withDuration` — `_shared/logger.ts`
- [x] TanStack Query infraestructura: `queryClient.ts`, `queryKeys.ts`, QueryClientProvider en App.tsx
- [x] NotificationBell → Supabase Realtime + fallback 30s
- [x] BankTransferStatusPage → Supabase Realtime + fallback 60s
- [x] Cron reconciliation con discrepancy logging + timing
- [x] Build OK, tests OK (210 passed, 6 pre-existentes fallando)

---

## Sesión 2 — TanStack Query Migration + Hardening (completado)

### Fase 1: Migrar hooks simples a useQuery
- [x] `usePlans` → `useQuery` con `staleTime: 15 * 60 * 1000`
- [x] `usePlansData` (admin) → invalidar via `queryClient.invalidateQueries`
- [x] `useBillingData` → `useQuery` para subscription + payments, `invalidateAll()` helper
- [x] `DashboardPage` → `useQuery` con queryKeys.dashboard
- [x] `NotificationsPage` → `useQuery` con filtro en queryKey

### Fase 2: Migrar admin pages a useQuery
- [x] `AdminDashboardPage` — 4 parallel `useQuery` (stats, schools, pendingPayments, recentSales)
- [x] `AdminPaymentsPage` — `useQuery` + `invalidateQueries` en approve/reject
- [x] `AdminActivityPage` — `useQuery` con queryKeys.adminActivity
- [x] `AdminMetricsPage` — 2 parallel `useQuery` (summary + monthly)
- [x] `AdminSchoolsPage` — `useQuery` + `invalidateQueries` en toggle/delete

### Fase 3: BillingSection polling → Realtime
- [x] Reemplazar `setInterval(poll, 10_000)` por Supabase Realtime + fallback 60s
- [x] Stop Realtime en terminal status (approved/rejected)

### Fase 4: queryKeys + cleanup
- [x] queryKeys expandido con todas las keys (admin, dashboard, etc.)
- [x] `invalidatePlansCache()` — solo queda stub deprecated, no se llama en ningún lado
- [x] No quedan `useState + useEffect` para data fetching
- [x] `setInterval` solo en fallbacks Realtime (NotificationBell 30s, BankTransferStatusPage 60s, BillingSection 60s)

### Verificación
- [x] `pnpm build` sin errores
- [x] `pnpm test -- run` — 210 passed, 6 failed (pre-existentes, mismos que sesión 1)
- [x] Grep: no quedan `setInterval` para data fetching (solo fallbacks Realtime)
- [x] Grep: no quedan `useState + useEffect + .then(set` patterns
