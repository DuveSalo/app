# Event Information Feature

CRUD module for managing safety event records and related documentation.

## Architecture

```
event-information/
├── EventInformationListPage.tsx        # List view
├── CreateEditEventInformationPage.tsx   # Create/Edit form
└── components/
    └── DynamicListInput.tsx            # Reusable dynamic list input field
```

## Rules

- Follows the canonical CRUD pattern from `fire-extinguishers/`.
- Service: `src/lib/api/services/event.ts`.
- Types: `src/types/event.ts`.
- `DynamicListInput` allows adding/removing list items dynamically — use for multi-value fields.
