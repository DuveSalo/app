import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminStats } from './stats';

vi.mock('../../../supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../../../supabase/client';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

describe('getAdminStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates monthly revenue from approved manual bank-transfer payments only', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 7, error: null }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 1, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({
              data: [{ amount: 5000 }, { amount: 7000 }],
              error: null,
            }),
          }),
        }),
      });

    const result = await getAdminStats();

    expect(result).toEqual({
      activeSchools: 7,
      pendingPayments: 2,
      rejectedPayments: 1,
      monthlyRevenue: 12000,
    });
    expect(mockFrom).not.toHaveBeenCalledWith('payment_transactions');
  });
});
