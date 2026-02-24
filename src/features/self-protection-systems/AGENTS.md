# Self-Protection Systems Feature

CRUD module for managing self-protection and fire safety systems in school facilities.

## Architecture

```
self-protection-systems/
├── SelfProtectionSystemListPage.tsx      # List view
└── CreateEditSelfProtectionSystemPage.tsx # Create/Edit form
```

## Rules

- Follows the canonical CRUD pattern from `fire-extinguishers/`.
- Service: `src/lib/api/services/system.ts`.
- Types: `src/types/system.ts`.
- Systems have multiple sub-components — form should use section-based layout like fire-extinguishers.
