# Common Rules

## Git Workflow
- Create NEW commits, never amend unless explicitly asked
- Use descriptive commit messages: type(scope): description
- Never force push to main/master
- Never skip hooks (--no-verify)
- Stage specific files, avoid `git add -A` or `git add .`

## Testing
- Unit tests: Vitest 4 + React Testing Library, co-located with source
- Use factories from `src/test/factories.ts` for mock data
- Use `renderWithAuth()` from `src/test/renderHelpers.tsx` for component tests
- Mock `@/lib/auth/AuthContext` BEFORE importing when using renderWithAuth
- Target 80% coverage for new code

## Performance
- Lazy-load all page components via routes.config.ts
- Use explicit `.select('col1, col2')` over `.select('*')` in Supabase queries
- TanStack Query: use queryKeys factory, never inline key arrays
- Skeleton loading for all pages, no page-level spinners

## File Size Limits
- API service files: max 300 lines → split into directory with barrel index.ts
- Custom hooks: max 150 lines → split by responsibility
- Page components: max 400 lines → extract into feature components

## Error Handling
- Use `handleSupabaseError()` + custom error classes from `lib/utils/errors.ts`
- Destructive actions: always AlertDialog or ConfirmDialog, never window.confirm()
- Toast notifications via Sonner: success/error/info

## Security
- Never expose `service_role` key in client code
- Validate JWT in all Edge Functions before business logic
- No `dangerouslySetInnerHTML` without sanitization
- Webhook handlers must verify signatures and be idempotent
