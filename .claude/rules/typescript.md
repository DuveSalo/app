# TypeScript Rules

## Strict Type Safety
- NEVER use `as any` — fix the type properly or use `satisfies` for type narrowing
- NEVER use `Record<string, unknown>` for database rows — use `Tables<'table_name'>` from `@/types/database.types`
- Prefer `satisfies` over `as` for type assertions where possible
- Use exhaustive switch patterns with `never` default for union types
- Enable and respect all strict mode flags

## Null Safety
- Always handle null/undefined cases explicitly
- Use optional chaining (`?.`) and nullish coalescing (`??`) over manual checks
- Never use non-null assertion (`!`) without a comment explaining why it's safe

## Zod v4 Specifics
- Use `error` not `required_error` for validation messages: `z.string({ error: 'Required' })`
- Use `.or(z.literal(""))` for optional string fields
- Schemas live in `features/{name}/schemas.ts` — one file per feature module
- Always infer types from schemas: `type MyForm = z.infer<typeof mySchema>`

## Database Types
- After ANY migration, regenerate types: `npx supabase gen types typescript --project-id <id> > apps/web/src/types/database.types.ts`
- Use `Tables<'table_name'>` for row types, `TablesInsert<'table_name'>` for inserts
- Use `mapXFromDb` functions to convert snake_case DB → camelCase domain types

## Imports
- Use path alias `@/` for all imports (maps to `apps/web/src/`)
- Environment variables: always `import { env } from '@/lib/env'`, never `process.env`
- Toast: always `import { toast } from 'sonner'` directly
