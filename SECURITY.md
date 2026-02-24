# Security Policy — Escuela Segura

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main) | Yes |

## Reporting a Vulnerability

If you discover a security vulnerability in Escuela Segura, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities.
2. Email the security team with a detailed description.
3. Include steps to reproduce, affected components, and potential impact.
4. You will receive acknowledgment within 5 business days.

## Security Architecture

### Authentication
- Google OAuth 2.0 via Supabase Auth with PKCE (Proof Key for Code Exchange)
- Session tokens stored in browser with automatic refresh
- No password storage — delegated entirely to OAuth providers

### Authorization
- 3-level route guard: authenticated user → company membership → active subscription
- Supabase Row-Level Security (RLS) on all database tables
- Edge Functions validate JWT before any data operations
- `service_role` key used only in server-side Edge Functions, never exposed to client

### Data Protection
- All client-server communication over HTTPS
- Environment variables validated at startup with Zod schemas
- Sensitive keys (PayPal secrets, service_role) stored exclusively in Supabase Edge Function secrets
- Content Security Policy (CSP) headers restrict resource loading

### Payment Security
- PayPal SDK handles all payment card data — PCI compliance delegated to PayPal
- Webhook signatures verified before processing payment events
- Idempotent webhook handling prevents duplicate processing

## Out of Scope

The following are considered out of scope for vulnerability reports:

- CSRF on non-sensitive endpoints (Supabase PKCE handles this)
- Missing rate limiting on non-authentication endpoints
- Content spoofing via text injection on non-sensitive pages
- Vulnerabilities in third-party dependencies without a working exploit
- Automated scanning results without manual verification

## Security Best Practices for Contributors

1. Never commit secrets, API keys, or credentials to the repository
2. Always use `@/lib/env` for environment variable access (Zod-validated)
3. Never use `dangerouslySetInnerHTML` — if unavoidable, sanitize with DOMPurify
4. Use parameterized Supabase queries — never concatenate user input into queries
5. Keep dependencies updated — run `npm audit` regularly
6. Test authentication edge cases (expired tokens, revoked sessions)
