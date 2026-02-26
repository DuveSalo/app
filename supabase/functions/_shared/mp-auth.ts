/**
 * MercadoPago API authentication and utilities.
 * Shared across all MercadoPago-related Edge Functions.
 *
 * MercadoPago uses a static Access Token — no token refresh needed.
 */

export class MercadoPagoError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: unknown[],
  ) {
    super(message);
    this.name = 'MercadoPagoError';
  }
}

interface MpConfig {
  mode: 'sandbox' | 'production';
  accessToken: string;
  baseUrl: string;
  webhookSecret: string;
}

export function getMpConfig(): MpConfig {
  const mode = (Deno.env.get('MP_MODE') as 'sandbox' | 'production') || 'sandbox';
  return {
    mode,
    accessToken: Deno.env.get('MP_ACCESS_TOKEN')!,
    baseUrl: 'https://api.mercadopago.com',
    webhookSecret: Deno.env.get('MP_WEBHOOK_SECRET')!,
  };
}

export function getMpHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  const config = getMpConfig();
  return {
    Authorization: `Bearer ${config.accessToken}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/**
 * Wrapper for MercadoPago API calls with retry for 5xx and 429 errors.
 * Retries 3x with exponential backoff.
 */
export async function mpFetch<T>(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        if (response.status === 204) return {} as T;
        return response.json();
      }

      const errorBody = await response.json().catch(() => ({}));

      // Don't retry client errors (4xx) except 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new MercadoPagoError(
          errorBody.error || 'CLIENT_ERROR',
          errorBody.message || `HTTP ${response.status}`,
          response.status,
          errorBody.cause,
        );
      }

      lastError = new MercadoPagoError(
        errorBody.error || 'SERVER_ERROR',
        errorBody.message || `HTTP ${response.status}`,
        response.status,
      );

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
      await new Promise((r) => setTimeout(r, delay));
    } catch (error) {
      if (error instanceof MercadoPagoError && error.statusCode && error.statusCode < 500) {
        throw error;
      }
      lastError = error as Error;

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError || new Error('MercadoPago API call failed after retries');
}
