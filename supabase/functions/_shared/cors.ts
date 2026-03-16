/**
 * CORS headers for Edge Functions.
 * Only allow known origins — never use wildcard in production.
 */

const ALLOWED_ORIGINS = [
  'https://escuelasegura.com',
  'https://www.escuelasegura.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin || '')
    ? origin!
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}
