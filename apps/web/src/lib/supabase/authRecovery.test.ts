import { describe, expect, it, vi } from 'vitest';
import {
  isInvalidRefreshTokenError,
  recoverSupabaseAuthSession,
  type AuthRecoveryClient,
} from './authRecovery';

const createInvalidRefreshTokenError = () =>
  Object.assign(new Error('Invalid Refresh Token: Refresh Token Not Found'), {
    name: 'AuthApiError',
    status: 400,
    code: 'refresh_token_not_found',
  });

describe('auth recovery', () => {
  it('recognizes Supabase invalid refresh-token errors', () => {
    expect(isInvalidRefreshTokenError(createInvalidRefreshTokenError())).toBe(true);
    expect(
      isInvalidRefreshTokenError(
        Object.assign(new Error('Invalid Refresh Token: Already Used'), {
          status: 400,
          code: 'refresh_token_already_used',
        })
      )
    ).toBe(true);
    expect(isInvalidRefreshTokenError(new Error('Network request failed'))).toBe(false);
  });

  it('clears local auth state without logging when getSession returns an invalid refresh-token error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const client = {
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: null },
          error: createInvalidRefreshTokenError(),
        })),
        refreshSession: vi.fn(async () => ({
          data: { session: null, user: null },
          error: null,
        })),
        signOut: vi.fn(async () => ({ error: null })),
      },
    } satisfies AuthRecoveryClient;

    await expect(recoverSupabaseAuthSession(client)).resolves.toEqual({ status: 'signed-out' });

    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(client.auth.refreshSession).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('validates a stored session by refreshing it and clears stale refresh tokens locally', async () => {
    const client = {
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { refresh_token: 'stale-refresh-token' } },
          error: null,
        })),
        refreshSession: vi.fn(async () => ({
          data: { session: null, user: null },
          error: createInvalidRefreshTokenError(),
        })),
        signOut: vi.fn(async () => ({ error: null })),
      },
    } satisfies AuthRecoveryClient;

    await expect(recoverSupabaseAuthSession(client)).resolves.toEqual({ status: 'signed-out' });

    expect(client.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'stale-refresh-token',
    });
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('keeps valid sessions after a successful refresh', async () => {
    const client = {
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { refresh_token: 'valid-refresh-token' } },
          error: null,
        })),
        refreshSession: vi.fn(async () => ({
          data: { session: { refresh_token: 'rotated-refresh-token' }, user: null },
          error: null,
        })),
        signOut: vi.fn(async () => ({ error: null })),
      },
    } satisfies AuthRecoveryClient;

    await expect(recoverSupabaseAuthSession(client)).resolves.toEqual({ status: 'recovered' });

    expect(client.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'valid-refresh-token',
    });
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });
});
