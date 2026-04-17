# PRD: Admin Panel + Bank Transfer Payments

## Task

Build a complete admin panel inside /app/admin/* with an admin role guard, and implement bank transfer as an alternative payment method. The admin panel must allow the platform owner to manage schools, approve bank transfer payments, view activity logs, monitor retention metrics, and configure subscription plans.

Read these files completely before starting:
- `CLAUDE.md` — project architecture, commands, conventions
- `docs/DESIGN-SYSTEM.md` — visual design rules (tokens, typography, components, patterns)
- `docs/SECURITY-AUDIT.md` — security patterns already implemented
- `docs/RATE-LIMITING.md` — rate limiting plan

## Reference

The admin panel should look and feel identical to the existing app — same shadcn components, same design tokens, same layout pattern (sidebar + content area). The admin gets its own sidebar with admin-specific navigation.

Rules extracted from the reference (existing app):
- Always use shadcn/ui components (Button, Card, DataTable, Badge, DropdownMenu, Dialog, AlertDialog, Tabs, Skeleton, Sonner)
- Always use semantic color tokens from globals.css, never hardcode colors
- Always use rounded-lg (10px) on everything
- Always use the typography scale from DESIGN-SYSTEM.md (text-2xl font-semibold for page titles, text-base font-medium for section titles, text-sm for body)
- Always use Skeleton loading, never full-page spinners
- Always use toast (Sonner) for action feedback
- Always use AlertDialog with destructive button for irreversible actions
- Never allow row click navigation in tables — only through DropdownMenu actions
- Never put subtitles below page titles
- Never use bg-white or bg-black — use bg-background and text-foreground

## Success Criteria

Output type: Full-stack feature (database migrations, API services, components, pages, routing)

What the admin should think/feel after using it:
- "I can see everything that's happening in my platform at a glance"
- "Approving payments and managing schools is fast and simple"
- "The data is accurate and up-to-date"

What to avoid:
- Overengineered UI — keep it simple and functional
- Slow loading — use efficient queries with proper indexes
- Security holes — admin role must be bulletproof

Success means:
- Admin can approve/reject bank transfer payments in under 10 seconds
- Admin can find any school and see its full status in under 5 seconds
- All admin actions are logged
- No non-admin user can access any admin page or API

## Rules

### Security (non-negotiable)
- Admin role is defined in Supabase Auth `app_metadata.role = 'admin'`
- Admin role can ONLY be set via SQL or Edge Functions with service_role — never from client code
- All admin API queries must verify admin role server-side (not just UI guard)
- All admin RLS policies use `auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'`
- Admin actions (approve, reject, suspend, delete) must be logged in activity_logs table
- Bank transfer comprobantes are stored in a PRIVATE Supabase Storage bucket with signed URLs

### Architecture
- Admin pages live in `features/admin/` following the existing feature module pattern
- Admin routes are under `/app/admin/*` within the existing React Router SPA
- Admin guard (`AdminRoute`) wraps all admin routes — redirects non-admins to /app/dashboard
- Admin has its own sidebar with admin-specific navigation
- Admin uses the same API service pattern as the rest of the app (`lib/api/services/admin.ts`)
- New database tables need migrations in `supabase/migrations/`

### Design
- Follow docs/DESIGN-SYSTEM.md exactly — no exceptions
- Admin sidebar: same visual style as user sidebar but different navigation items and a distinct accent color or label ("Admin") to differentiate
- DataTables with search, column header sorting, filter by status with DropdownMenuCheckboxItem
- Stat cards identical to the dashboard pattern
- Badges use the same 5 semantic variants (positive/warning/negative/neutral/informative)

## Conversation (clarifying decisions)

### Database schema for bank transfers

```
manual_payments:
  id: uuid (PK)
  company_id: uuid (FK → companies)
  amount: integer (cents)
  period_start: date
  period_end: date
  receipt_url: text (Supabase Storage path)
  receipt_uploaded_at: timestamptz
  status: text ('pending' | 'approved' | 'rejected')
  reviewed_by: uuid (FK → auth.users, nullable)
  reviewed_at: timestamptz (nullable)
  rejection_reason: text (nullable)
  created_at: timestamptz
  updated_at: timestamptz
```

### Database schema for activity logs

```
activity_logs:
  id: uuid (PK)
  admin_id: uuid (FK → auth.users)
  action: text ('approve_payment', 'reject_payment', 'suspend_school', 'activate_school', 'delete_school', 'update_plan', etc.)
  target_type: text ('company', 'manual_payment', 'subscription', etc.)
  target_id: uuid
  metadata: jsonb (additional context, e.g., { reason: "..." })
  created_at: timestamptz
```

### Companies table changes

Add to companies table:
- `payment_method: text ('bank_transfer')` — nullable; `NULL` means no method selected yet
- `bank_transfer_status: text ('pending' | 'active' | 'suspended' | 'rejected')` — nullable, only for bank_transfer

### Admin navigation items

- Dashboard (LayoutDashboard icon)
- Escuelas (Building2 icon)
- Pagos pendientes (CreditCard icon)
- Actividad (Activity icon)
- Métricas (BarChart3 icon)
- Planes (Settings icon)

### User flow for bank transfer payment

1. During subscription selection, user uses "Transferencia bancaria"
2. App shows bank details (CBU, alias, titular, banco) and instructions
3. User makes the transfer externally (via their bank app)
4. User uploads comprobante (photo/PDF) in the app
5. Status becomes "Pendiente de verificación"
6. Admin reviews and approves/rejects from the admin panel
7. If approved → subscription activates
8. If rejected → user gets notification with reason, can re-upload
9. Monthly: cron job checks which bank transfer subscriptions are due, sends reminder emails, suspends if overdue by X days

## Plan (execution phases)

### Phase A — Foundation (1 session)
Database migrations (manual_payments, activity_logs, companies columns, admin RLS policies), admin role setup (set app_metadata for your email), AdminRoute guard component, admin layout with sidebar, admin routing in routes.config.ts.

### Phase B — Admin Dashboard (1 session)
Stat cards (active/pending/rejected schools, monthly revenue), recent registrations list, pending bank transfer approvals with approve/reject buttons, recent sales table.

### Phase C — Schools Management (1 session)
DataTable of all schools with search/filters/sort, school detail page (company info, employees, documents, payment history, subscription status), DropdownMenu actions (edit, suspend, activate, delete with AlertDialog).

### Phase D — Bank Transfer User Flow (1 session)
Add "Transferencia bancaria" option to subscription flow, bank details display page, comprobante upload page/component (FileUpload to private bucket), user payment status page showing pending/approved/rejected, notification when payment is approved/rejected.

### Phase E — Bank Transfer Admin Management (1 session)
Dedicated comprobantes page with DataTable (pending/approved/rejected), approve/reject with Dialog (rejection requires reason), signed URL to view comprobante PDF/image, auto-log all actions to activity_logs.

### Phase F — Activity Logs + Metrics + Plans (1 session)
Activity logs page with DataTable (searchable, filterable by action type), retention metrics page with charts (Recharts: registrations vs active vs cancelled per month), plan configuration page (CRUD on plans table: name, price, features, active).

## Alignment

Before writing any code in each phase:
1. Read CLAUDE.md, docs/DESIGN-SYSTEM.md, and this PRD
2. Enumerate the 3 most important rules for that phase
3. Write the plan in tasks/todo.md with verifiable items
4. Confirm the plan before starting implementation
5. Use subagents to parallelize independent work
6. Run npx tsc --noEmit and pnpm build after each phase
7. Update docs/SECURITY-AUDIT.md if new security patterns are added
8. Log lessons learned in tasks/lessons.md
