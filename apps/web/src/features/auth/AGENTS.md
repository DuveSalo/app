# Auth Feature

Authentication, onboarding, and subscription checkout flow for Escuela Segura.

## Architecture

```
auth/
├── AuthContext.tsx           # Global auth state (user, company, session)
├── AuthPage.tsx              # Login/Register page
├── AuthCallbackPage.tsx      # OAuth callback handler
├── CreateCompanyPage.tsx     # Onboarding step 1: create company
├── SubscriptionPage.tsx      # Onboarding step 2: MercadoPago checkout
├── TrialExpiredPage.tsx      # Trial expiration redirect
└── components/
    └── CardForm.tsx          # Payment card form component
```

## Critical Rules

- **AuthContext is the single source of truth** for auth state. Never store user/company data in component-level state that duplicates AuthContext.
- **PKCE flow**: Supabase handles OAuth via PKCE. No CSRF tokens needed.
- **Session persistence**: Supabase client auto-refreshes tokens. Never manually manage JWTs.
- **Google OAuth only**: Currently the only OAuth provider. `loginWithGoogle()` in AuthContext triggers the flow.
- **Onboarding guard**: ProtectedRoute enforces the order: Login → Company → Subscribe. Users cannot skip steps.

## Auth Flow

```
1. User clicks "Login with Google"
2. Supabase redirects to Google OAuth consent
3. Google redirects back to /auth/callback
4. AuthCallbackPage extracts session, sets AuthContext
5. ProtectedRoute checks: user? → company? → subscription?
6. Missing company → /create-company
7. Missing subscription → /subscribe (or trial)
8. All present → /dashboard
```

## Security Considerations

- Never store tokens in localStorage manually — Supabase handles this.
- Always use `supabase.auth.getUser()` for server-verified user identity, not `getSession()`.
- Payment secrets (MercadoPago access token, webhook secrets) must NEVER appear in client code.
- Redirect URLs must be validated — only allow known origins.

## Testing

- `ProtectedRoute.test.tsx` covers the 3-level guard logic.
- Test auth edge cases: expired sessions, revoked Google access, missing company, expired trials.
