/**
 * PayPal OAuth 2.0 authentication and API utilities.
 * Shared across all PayPal-related Edge Functions.
 */

export class PayPalError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public paypalDebugId?: string,
    public details?: unknown[],
  ) {
    super(message);
    this.name = 'PayPalError';
  }
}

interface PayPalConfig {
  mode: 'sandbox' | 'live';
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  webhookId: string;
}

export function getPayPalConfig(): PayPalConfig {
  const mode = (Deno.env.get('PAYPAL_MODE') as 'sandbox' | 'live') || 'sandbox';
  return {
    mode,
    clientId: Deno.env.get('PAYPAL_CLIENT_ID')!,
    clientSecret: Deno.env.get('PAYPAL_CLIENT_SECRET')!,
    baseUrl:
      mode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com',
    webhookId: Deno.env.get('PAYPAL_WEBHOOK_ID')!,
  };
}

// Token cache (module-level, lives for the function invocation lifetime)
let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 60_000) {
    return cachedToken;
  }

  const config = getPayPalConfig();
  const credentials = btoa(`${config.clientId}:${config.clientSecret}`);

  const response = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new PayPalError(
      'AUTH_FAILED',
      `Token request failed: ${error.error_description || response.statusText}`,
      response.status,
    );
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedToken!;
}

export async function getAuthHeaders(
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra,
  };
}

/**
 * Wrapper for PayPal API calls with retry for 5xx and 429 errors.
 */
export async function paypalFetch<T>(
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
      const debugId = response.headers.get('paypal-debug-id') || undefined;

      // Don't retry client errors (4xx) except 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new PayPalError(
          errorBody.name || 'CLIENT_ERROR',
          errorBody.message || `HTTP ${response.status}`,
          response.status,
          debugId,
          errorBody.details,
        );
      }

      lastError = new PayPalError(
        errorBody.name || 'SERVER_ERROR',
        errorBody.message || `HTTP ${response.status}`,
        response.status,
        debugId,
      );

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
      await new Promise((r) => setTimeout(r, delay));
    } catch (error) {
      if (error instanceof PayPalError && error.statusCode && error.statusCode < 500) {
        throw error;
      }
      lastError = error as Error;

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError || new Error('PayPal API call failed after retries');
}
