/**
 * CORS headers for Edge Functions.
 * Only allow known origins — never use wildcard in production.
 */

const STATIC_ALLOWED_ORIGINS = [
  'https://escuelasegura.com',
  'https://www.escuelasegura.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function getConfiguredOrigins(): string[] {
  const appUrlOrigin = normalizeOrigin(Deno.env.get('APP_URL'));
  const extraOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  return [...STATIC_ALLOWED_ORIGINS, appUrlOrigin, ...extraOrigins].filter(
    (origin): origin is string => Boolean(origin)
  );
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getConfiguredOrigins();
  const allowedOrigin = allowedOrigins.includes(origin || '')
    ? origin!
    : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-idempotency-key',
    'Vary': 'Origin',
  };
}
