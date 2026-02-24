# Conservation Certificates Feature

CRUD module for managing conservation and maintenance certificates for school facilities.

## Architecture

```
conservation-certificates/
├── ConservationCertificateListPage.tsx      # List view
└── CreateEditConservationCertificatePage.tsx # Create/Edit form
```

## Rules

- Follows the canonical CRUD pattern from `fire-extinguishers/`.
- Service: `src/lib/api/services/certificate.ts`.
- Types: `src/types/certificate.ts`.
- Certificates have expiration dates — use the `expirationThresholds` constants for status coloring.
