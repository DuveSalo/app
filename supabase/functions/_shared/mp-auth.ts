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

// ---------------------------------------------------------------------------
// Circuit Breaker
// ---------------------------------------------------------------------------
// Simple state machine to avoid hammering MercadoPago when the API is down.
//   closed    → normal operation, requests pass through
//   open      → all requests rejected immediately (503)
//   half-open → allow a single probe request; success → closed, failure → open

type CircuitState = 'closed' | 'open' | 'half-open';

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT = 60_000; // 60 seconds

let circuitState: CircuitState = 'closed';
let consecutiveFailures = 0;
let lastFailureTime = 0;

/** Record a successful response — resets the circuit to closed. */
function onSuccess(): void {
  consecutiveFailures = 0;
  circuitState = 'closed';
}

/** Record a failed response — may trip the circuit to open. */
function onFailure(): void {
  consecutiveFailures++;
  lastFailureTime = Date.now();
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    circuitState = 'open';
  }
}

/**
 * Check whether the circuit allows a request through.
 * Transitions open → half-open after RECOVERY_TIMEOUT elapses.
 * Throws immediately when the circuit is open.
 */
function assertCircuitClosed(): void {
  if (circuitState === 'closed') return;

  if (circuitState === 'open') {
    const elapsed = Date.now() - lastFailureTime;
    if (elapsed >= RECOVERY_TIMEOUT) {
      // Enough time has passed — allow one probe request
      circuitState = 'half-open';
      return;
    }
    throw new MercadoPagoError(
      'CIRCUIT_OPEN',
      'MercadoPago circuit breaker is open — requests are temporarily blocked',
      503,
    );
  }

  // half-open: allow the probe request through
}

// ---------------------------------------------------------------------------
// Config & Headers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// mpFetch — retry with exponential backoff + jitter + circuit breaker
// ---------------------------------------------------------------------------

/**
 * Wrapper for MercadoPago API calls with:
 *  - Circuit breaker (fails fast when the API is persistently down)
 *  - Retry for 5xx and 429 errors (3 attempts by default)
 *  - Exponential backoff with random jitter to prevent thundering herd
 */
export async function mpFetch<T>(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<T> {
  // Fail fast if the circuit is open
  assertCircuitClosed();

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        if (response.status === 204) {
          onSuccess();
          return {} as T;
        }
        const data = await response.json();
        onSuccess();
        return data;
      }

      const errorBody = await response.json().catch(() => ({}));

      // Don't retry client errors (4xx) except 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        // Client errors are not the API being "down" — don't count as circuit failures
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

      // Exponential backoff with jitter: 50%-100% of the base delay
      const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
      const delay = baseDelay * (0.5 + Math.random() * 0.5);
      await new Promise((r) => setTimeout(r, delay));
    } catch (error) {
      if (error instanceof MercadoPagoError && error.statusCode && error.statusCode < 500) {
        throw error;
      }
      lastError = error as Error;

      // Exponential backoff with jitter
      const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
      const delay = baseDelay * (0.5 + Math.random() * 0.5);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // All retries exhausted — record failure for circuit breaker
  onFailure();

  throw lastError || new Error('MercadoPago API call failed after retries');
}
