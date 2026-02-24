# Fire Extinguishers Feature (Canonical CRUD Pattern)

**This is the reference implementation for all CRUD features.** New features should follow this structure exactly.

## Architecture

```
fire-extinguishers/
├── FireExtinguisherListPage.tsx        # List view with table + filters
├── CreateEditFireExtinguisherPage.tsx   # Shared create/edit form
├── types.ts                            # Feature-specific types
├── components/
│   ├── AccessibilitySection.tsx         # Form section: accessibility checks
│   ├── CabinetSection.tsx              # Form section: cabinet info
│   ├── ConditionsSection.tsx           # Form section: conditions assessment
│   ├── IdentificationSection.tsx       # Form section: extinguisher ID
│   ├── LocationSection.tsx             # Form section: location details
│   ├── ObservationsSection.tsx         # Form section: free-text observations
│   ├── SignageSection.tsx              # Form section: signage verification
│   └── index.ts                        # Barrel export
└── hooks/
    └── useFireExtinguisherValidation.ts # Zod-based form validation
```

## Pattern Rules

1. **List page**: Fetches paginated data from service, renders with `Table` from `@/components/common`.
2. **Create/Edit page**: Single component handles both modes via URL param (`/fire-extinguishers/new` vs `/fire-extinguishers/:id`).
3. **Form sections**: Large forms split into logical sections as separate components. Each receives form state via props.
4. **Validation hook**: Zod schema validates form before submission. Returns `{ errors, validate, clearError }`.
5. **Service layer**: `src/lib/api/services/fireExtinguisher.ts` handles all Supabase CRUD operations.
6. **Types**: Feature-specific types in `types.ts`. Shared types in `src/types/fire-extinguisher.ts`.

## Copying This Pattern

When creating a new CRUD feature:

```bash
# 1. Create folder structure
src/features/{new-feature}/
├── {NewFeature}ListPage.tsx
├── CreateEdit{NewFeature}Page.tsx
├── types.ts
├── components/
│   └── index.ts
└── hooks/
    └── use{NewFeature}Validation.ts

# 2. Create service
src/lib/api/services/{newFeature}.ts

# 3. Create shared type
src/types/{new-feature}.ts

# 4. Add routes
src/constants/routes.ts → ROUTE_PATHS
src/routes/routes.config.ts → LazyPages + route config

# 5. Create AGENTS.md for the new feature
```
