import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock auth context BEFORE any imports that use it
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Hoist mock helpers so they are available inside vi.mock factory
const { mockChannel, mockRemoveChannel, mockSupabaseChannel } = vi.hoisted(() => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };
  const mockRemoveChannel = vi.fn();
  const mockSupabaseChannel = vi.fn(() => mockChannel);
  return { mockChannel, mockRemoveChannel, mockSupabaseChannel };
});

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: mockSupabaseChannel,
    removeChannel: mockRemoveChannel,
  },
}));

// Mock useQueryClient
const mockInvalidateQueries = vi.fn();
const mockQueryClient = { invalidateQueries: mockInvalidateQueries };
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

import { RealtimeProvider } from './RealtimeProvider';

describe('RealtimeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-wire channel mock after clearAllMocks
    mockChannel.on.mockReturnThis();
    mockChannel.subscribe.mockReturnThis();
    mockSupabaseChannel.mockReturnValue(mockChannel);
  });

  it('does not create a channel when currentUser is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      currentCompany: null,
      isAdmin: false,
    });

    render(
      <RealtimeProvider>
        <div />
      </RealtimeProvider>
    );

    expect(mockSupabaseChannel).not.toHaveBeenCalled();
  });

  it('does not create a channel when regular user has no company', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { id: 'user-1', role: undefined },
      currentCompany: null,
      isAdmin: false,
    });

    render(
      <RealtimeProvider>
        <div />
      </RealtimeProvider>
    );

    expect(mockSupabaseChannel).not.toHaveBeenCalled();
  });

  it('creates a channel with company_id filter when regular user with company', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { id: 'user-1', role: undefined },
      currentCompany: { id: 'comp-1' },
      isAdmin: false,
    });

    render(
      <RealtimeProvider>
        <div />
      </RealtimeProvider>
    );

    expect(mockSupabaseChannel).toHaveBeenCalledWith('realtime:comp-1');
    expect(mockChannel.on).toHaveBeenCalled();
    // Verify at least one .on call includes the company_id filter
    const onCalls = mockChannel.on.mock.calls;
    const hasFilteredCall = onCalls.some(
      (call) =>
        call[1] &&
        typeof call[1] === 'object' &&
        'filter' in call[1] &&
        (call[1] as Record<string, unknown>).filter === 'company_id=eq.comp-1'
    );
    expect(hasFilteredCall).toBe(true);
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('creates a channel without filter when user is admin', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { id: 'admin-1', role: 'admin' },
      currentCompany: null,
      isAdmin: true,
    });

    render(
      <RealtimeProvider>
        <div />
      </RealtimeProvider>
    );

    expect(mockSupabaseChannel).toHaveBeenCalledWith('realtime:admin');
    expect(mockChannel.on).toHaveBeenCalled();
    // Admin tables have no filter — verify none of the .on calls include a filter
    const onCalls = mockChannel.on.mock.calls;
    const hasFilteredCall = onCalls.some(
      (call) => call[1] && typeof call[1] === 'object' && 'filter' in call[1]
    );
    expect(hasFilteredCall).toBe(false);
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('calls removeChannel on unmount', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { id: 'user-1', role: undefined },
      currentCompany: { id: 'comp-1' },
      isAdmin: false,
    });

    const { unmount } = render(
      <RealtimeProvider>
        <div />
      </RealtimeProvider>
    );

    unmount();

    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('renders children', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      currentCompany: null,
      isAdmin: false,
    });

    const { getByText } = render(
      <RealtimeProvider>
        <span>hello</span>
      </RealtimeProvider>
    );

    expect(getByText('hello')).toBeInTheDocument();
  });

  it('registers the correct number of table listeners for a regular user (8 USER_TABLES)', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { id: 'user-1', role: undefined },
      currentCompany: { id: 'comp-1' },
      isAdmin: false,
    });

    render(
      <RealtimeProvider>
        <div />
      </RealtimeProvider>
    );

    // 8 USER_TABLES → 8 .on() calls
    expect(mockChannel.on).toHaveBeenCalledTimes(8);
  });

  it('registers the correct number of table listeners for an admin (3 ADMIN_TABLES)', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { id: 'admin-1', role: 'admin' },
      currentCompany: null,
      isAdmin: true,
    });

    render(
      <RealtimeProvider>
        <div />
      </RealtimeProvider>
    );

    // 3 ADMIN_TABLES → 3 .on() calls
    expect(mockChannel.on).toHaveBeenCalledTimes(3);
  });
});
