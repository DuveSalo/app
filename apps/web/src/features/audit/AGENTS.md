# Audit Feature

Audit trail logging — displays a chronological record of all system actions for compliance tracking.

## Architecture

```
audit/
├── AuditPage.tsx           # Main audit log view
└── components/
    ├── AuditFilters.tsx    # Date range + action type filters
    ├── AuditLogItem.tsx    # Individual audit entry display
    └── AuditLogList.tsx    # Scrollable audit log list
```

## Rules

- Audit logs are **read-only** — no create/edit/delete operations from the UI.
- Filters should support date range and action type filtering.
- Use `AuditLogItem` for consistent entry rendering across the list.
- Audit data comes from Supabase — ensure RLS policies allow read access only for company members.
