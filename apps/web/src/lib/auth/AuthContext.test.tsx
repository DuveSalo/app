import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import type { ReactNode } from 'react';

// Must mock before importing
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      startAutoRefresh: vi.fn().mockResolvedValue(undefined),
      stopAutoRefresh: vi.fn().mockResolvedValue(undefined),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
  },
  recoverSupabaseAuthSession: vi.fn().mockResolvedValue({ status: 'no-session' }),
  startManagedSupabaseAutoRefresh: vi.fn(() => vi.fn()),
}));

vi.mock('@/lib/api/services', () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
  getCompanyByUserId: vi.fn().mockRejectedValue(new Error('no company')),
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('@/lib/api/services/context', () => ({
  setServiceContext: vi.fn(),
  clearServiceContext: vi.fn(),
}));

vi.mock('@/lib/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { supabase } from '@/lib/supabase/client';
import { recoverSupabaseAuthSession } from '@/lib/supabase/client';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe('AuthContext — onAuthStateChange listener', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no initial user
    const mockOnAuthStateChange = supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>;
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('subscribes to onAuthStateChange exactly once on mount', async () => {
    const mockOnAuthStateChange = supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>;

    const { unmount } = renderHook(() => useAuth(), { wrapper });

    // Give effects time to settle
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Should have been called exactly once (listener registered once on mount)
    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('unsubscribes when component unmounts (cleanup)', async () => {
    const unsubscribeMock = vi.fn();
    const mockOnAuthStateChange = supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>;
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    });

    const { unmount } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('defers SIGNED_IN refresh until after the auth callback returns', async () => {
    let authStateCallback: ((event: 'SIGNED_IN') => void) | null = null;
    const mockOnAuthStateChange = supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>;
    mockOnAuthStateChange.mockImplementation((callback: (event: 'SIGNED_IN') => void) => {
      authStateCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const recoverMock = recoverSupabaseAuthSession as ReturnType<typeof vi.fn>;
    recoverMock.mockClear();

    expect(authStateCallback).not.toBeNull();
    const triggerAuthStateChange = authStateCallback as unknown as (event: 'SIGNED_IN') => void;
    triggerAuthStateChange('SIGNED_IN');

    expect(recoverMock).not.toHaveBeenCalled();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(recoverMock).toHaveBeenCalledTimes(1);
  });
});
