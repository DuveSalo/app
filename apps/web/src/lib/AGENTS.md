# Library Layer (src/lib/)

Shared utilities, API services, external SDK integrations, and core infrastructure.

## Architecture

```
lib/
├── api/
│   ├── services/           # One file per domain entity
│   │   ├── auth.ts         # Login, register, OAuth, session
│   │   ├── company.ts      # Company CRUD
│   │   ├── employee.ts     # Employee management
│   │   ├── certificate.ts  # Conservation certificates
│   │   ├── event.ts        # Event information
│   │   ├── fireExtinguisher.ts
│   │   ├── system.ts       # Self-protection systems
│   │   ├── qr.ts           # QR document management
│   │   ├── notifications.ts
│   │   ├── subscription.ts # MercadoPago subscription lifecycle
│   │   ├── pdf.ts          # PDF generation (jsPDF)
│   │   └── index.ts        # Barrel export
│   └── mappers.ts          # Shared DB → domain mappers
├── supabase/
│   └── client.ts           # Supabase client config (PKCE auth)
├── mercadopago/
│   ├── config.ts           # MercadoPago SDK config
│   └── index.ts
├── hooks/
│   ├── useForm.ts          # Generic form state management
│   ├── useEntityForm.ts    # CRUD entity form hook
│   └── index.ts
├── utils/
│   ├── errors.ts           # AuthError, NotFoundError, handleSupabaseError
│   ├── validation.ts       # Shared validation helpers
│   ├── logger.ts           # Structured logger
│   ├── dateUtils.ts        # Date formatting/parsing
│   ├── auditUtils.ts       # Audit log helpers
│   ├── companyUtils.ts     # Company-related helpers
│   ├── typeGuards.ts       # Runtime type narrowing
│   ├── trial.ts            # Trial status calculation
│   ├── sanitize.ts         # Input sanitization (XSS prevention)
│   └── index.ts
└── env.ts                  # Zod-validated environment config
```

## Critical Rules

### Services
- **One service per entity** — never mix domain logic across services.
- **Explicit columns**: `.select('id, name, status')` — avoid `.select('*')`.
- **Mapper pattern**: Every service uses `mapXFromDb()` to convert DB rows → domain types.
- **Error handling**: Wrap Supabase errors with `handleSupabaseError()`. Use `AuthError` for auth failures, `NotFoundError` for missing records.
- **Edge Function calls**: Use `supabase.functions.invoke('function-name', { body })` for server-side operations.

### Environment
- **Single source**: Always import from `@/lib/env`, NEVER from `import.meta.env`.
- **Schema validation**: Add new env vars to the Zod schema in `env.ts` before using them.
- **Required vs optional**: Use `.optional()` in Zod for non-critical env vars.

### Hooks
- **useForm**: Generic form state management. Returns `{ values, errors, handleChange, validate }`.
- **useEntityForm**: Extends useForm for CRUD entities. Handles loading existing data and submission.

### Utils
- **No business logic in utils** — keep them pure, stateless functions.
- **Test utils independently**: `dateUtils.test.ts` is the reference for util testing.

## Security Rules

- **Supabase client** uses PKCE — never manually manage JWTs.
- **MercadoPago Secure Fields** handle PCI compliance for card data.
- **Never log sensitive data** (tokens, keys, PII) — logger should sanitize output.
- **Sanitize user input** before rendering or storing — use `sanitize.ts` utilities.
