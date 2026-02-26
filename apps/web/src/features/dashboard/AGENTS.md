# Dashboard Feature

Main data hub — displays aggregated compliance metrics, filterable tables, and summary statistics.

## Architecture

```
dashboard/
├── DashboardPage.tsx        # Main page with filters + stats + table
└── components/
    ├── DashboardCards.tsx    # Summary stat cards row
    ├── DashboardFilters.tsx  # Date range + type filters
    ├── DashboardTable.tsx    # Main data table
    ├── StatCard.tsx          # Individual stat card component
    ├── Pagination.tsx        # Table pagination controls
    └── index.ts             # Barrel export
```

## Rules

- Dashboard aggregates data from multiple entities — use efficient Supabase queries with explicit column selection.
- All filters should be URL-synced (query params) for shareable/bookmarkable states.
- Stat cards use the semantic status color system: `emerald` (good), `amber` (warning), `red` (critical).
- Table must support sorting and pagination.

## Performance

- Use React.memo on StatCard components to avoid unnecessary re-renders when filters change.
- Avoid fetching all data at once — paginate and use server-side filtering.
