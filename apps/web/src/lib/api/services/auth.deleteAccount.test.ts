import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      refreshSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '../../supabase/client';
import { deleteAccount } from './auth';

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes the edge function with the current session token', async () => {
    const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>;
    const refreshSessionMock = supabase.auth.refreshSession as ReturnType<typeof vi.fn>;

    refreshSessionMock.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    });
    invokeMock.mockResolvedValue({
      data: { success: true },
      error: null,
      response: new Response(null, { status: 200 }),
    });

    await expect(deleteAccount()).resolves.toBeUndefined();

    expect(refreshSessionMock).toHaveBeenCalled();
    expect(invokeMock).toHaveBeenCalledWith('delete-account', {
      headers: { Authorization: 'Bearer mock-token' },
    });
  });

  it('throws when there is no active session', async () => {
    const refreshSessionMock = supabase.auth.refreshSession as ReturnType<typeof vi.fn>;

    refreshSessionMock.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(deleteAccount()).rejects.toThrow('No hay sesión activa');
  });

  it('throws when refreshSession fails', async () => {
    const refreshSessionMock = supabase.auth.refreshSession as ReturnType<typeof vi.fn>;

    refreshSessionMock.mockResolvedValue({
      data: { session: null },
      error: { message: 'Refresh Token Not Found' },
    });

    await expect(deleteAccount()).rejects.toThrow('Refresh Token Not Found');
  });

  it('returns the structured error sent by the edge function', async () => {
    const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>;
    const refreshSessionMock = supabase.auth.refreshSession as ReturnType<typeof vi.fn>;

    refreshSessionMock.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    });
    invokeMock.mockResolvedValue({
      data: null,
      error: { message: 'Edge function error' },
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    });

    await expect(deleteAccount()).rejects.toThrow('Unauthorized');
  });
});
