import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getMetricsSummary } from './metrics';

vi.mock('../../../supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../../../supabase/client';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

describe('getMetricsSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates revenue from approved manual bank-transfer payments only', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 8, error: null }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ count: 10, error: null }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({
              data: [{ amount: 9000 }, { amount: 3000 }],
              error: null,
            }),
          }),
        }),
      });

    const result = await getMetricsSummary();

    expect(result).toEqual({
      totalActive: 8,
      newRegistrations: 3,
      retentionRate: 80,
      monthlyRevenue: 12000,
    });
    expect(mockFrom).not.toHaveBeenCalledWith('payment_transactions');
  });
});
