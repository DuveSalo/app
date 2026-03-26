import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from './notifications';

vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
      }),
    },
    functions: { invoke: vi.fn() },
    from: vi.fn(),
  },
}));

import { supabase } from '../../supabase/client';

const COMPANY_ID = 'company-123';

const mockNotificationRow = {
  id: 'notif-1',
  company_id: COMPANY_ID,
  user_id: 'user-1',
  type: 'expiration',
  category: 'fire_extinguisher',
  title: 'Matafuego por vencer',
  message: 'El matafuego EXT-001 vence en 30 días',
  link: '/app/fire-extinguishers/fe-1',
  related_table: 'fire_extinguishers',
  related_id: 'fe-1',
  is_read: false,
  read_at: null,
  created_at: '2026-03-15T00:00:00Z',
};

describe('notifications service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('returns paginated notifications', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;

      // Count query chain
      const countChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Data query chain
      const dataChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };

      // getNotifications uses Promise.all with two queries
      // First call: count query, Second call: data query
      fromMock
        .mockReturnValueOnce(countChain)
        .mockReturnValueOnce(dataChain);

      // Mock the Promise.all resolution by making the chains thenable
      const countPromise = Promise.resolve({ count: 1, error: null });
      const dataPromise = Promise.resolve({ data: [mockNotificationRow], error: null });

      // Override the chain to act as a promise
      Object.assign(countChain, { then: countPromise.then.bind(countPromise), catch: countPromise.catch.bind(countPromise) });
      Object.assign(dataChain, { then: dataPromise.then.bind(dataPromise), catch: dataPromise.catch.bind(dataPromise) });

      const result = await getNotifications(COMPANY_ID);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('notif-1');
      expect(result.items[0].title).toBe('Matafuego por vencer');
      expect(result.items[0].isRead).toBe(false);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('returns empty items when no notifications', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;

      const countChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      const dataChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };

      fromMock.mockReturnValueOnce(countChain).mockReturnValueOnce(dataChain);

      const countPromise = Promise.resolve({ count: 0, error: null });
      const dataPromise = Promise.resolve({ data: [], error: null });

      Object.assign(countChain, { then: countPromise.then.bind(countPromise), catch: countPromise.catch.bind(countPromise) });
      Object.assign(dataChain, { then: dataPromise.then.bind(dataPromise), catch: dataPromise.catch.bind(dataPromise) });

      const result = await getNotifications(COMPANY_ID);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(markAsRead('notif-1')).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith('notifications');
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(markAsRead('notif-1')).rejects.toThrow();
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read for a company', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      // The last .eq call resolves the promise
      chainMock.eq.mockReturnValueOnce(chainMock).mockResolvedValueOnce({ error: null });
      fromMock.mockReturnValue(chainMock);

      await expect(markAllAsRead(COMPANY_ID)).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith('notifications');
    });
  });

  describe('getUnreadCount', () => {
    it('returns unread notification count', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      // First .eq returns chain, second .eq resolves the promise
      chainMock.eq.mockReturnValueOnce(chainMock).mockResolvedValueOnce({ count: 5, error: null });
      fromMock.mockReturnValue(chainMock);

      const result = await getUnreadCount(COMPANY_ID);

      expect(result).toBe(5);
      expect(fromMock).toHaveBeenCalledWith('notifications');
    });

    it('returns 0 when count is null', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      chainMock.eq.mockReturnValueOnce(chainMock).mockResolvedValueOnce({ count: null, error: null });
      fromMock.mockReturnValue(chainMock);

      const result = await getUnreadCount(COMPANY_ID);

      expect(result).toBe(0);
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      chainMock.eq.mockReturnValueOnce(chainMock).mockResolvedValueOnce({ count: null, error: { message: 'DB error' } });
      fromMock.mockReturnValue(chainMock);

      await expect(getUnreadCount(COMPANY_ID)).rejects.toThrow();
    });
  });
});
