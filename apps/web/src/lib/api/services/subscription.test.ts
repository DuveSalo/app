import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getActiveSubscription, getPaymentHistory } from './subscription';
import { DatabaseError } from '../../utils/errors';

vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      }),
    },
    functions: { invoke: vi.fn() },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    }),
  },
}));

// Import supabase after mocking so we get the mocked version
import { supabase } from '../../supabase/client';

const COMPANY_ID = 'company-123';

const mockDbRow = {
  id: 'sub-1',
  company_id: COMPANY_ID,
  plan_key: 'basic',
  plan_name: 'Básico',
  amount: 5000,
  currency: 'ARS',
  status: 'active',
  subscriber_email: 'school@example.com',
  current_period_start: '2026-03-01',
  current_period_end: '2026-04-01',
  next_billing_time: '2026-04-01',
  activated_at: '2026-02-01',
  cancelled_at: null,
  suspended_at: null,
  failed_payments_count: 0,
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
  payment_provider: 'bank_transfer',
};

describe('subscription service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveSubscription', () => {
    it('returns mapped subscription when one exists', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockDbRow, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getActiveSubscription(COMPANY_ID);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('sub-1');
      expect(result?.companyId).toBe(COMPANY_ID);
      expect(result?.planKey).toBe('basic');
      expect(result?.planName).toBe('Básico');
      expect(result?.amount).toBe(5000);
      expect(result?.currency).toBe('ARS');
      expect(result?.status).toBe('active');
      expect(result?.subscriberEmail).toBe('school@example.com');
      expect(result?.failedPaymentsCount).toBe(0);
      expect(result?.cancelledAt).toBeNull();
      expect(result?.createdAt).toBe('2026-02-01T00:00:00Z');

      expect(fromMock).toHaveBeenCalledWith('subscriptions');
      expect(chainMock.eq).toHaveBeenCalledWith('company_id', COMPANY_ID);
    });

    it('returns null when no subscription exists', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getActiveSubscription(COMPANY_ID);

      expect(result).toBeNull();
    });

    it('throws a DatabaseError when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(getActiveSubscription(COMPANY_ID)).rejects.toThrow('Database error');
      await expect(getActiveSubscription(COMPANY_ID)).rejects.toBeInstanceOf(DatabaseError);
    });

    it('uses ARS as default currency when currency is null', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const rowWithNullCurrency = { ...mockDbRow, currency: null };
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: rowWithNullCurrency, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getActiveSubscription(COMPANY_ID);

      expect(result?.currency).toBe('ARS');
    });

    it('defaults failedPaymentsCount to 0 when null in DB', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const rowWithNullCount = { ...mockDbRow, failed_payments_count: null };
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: rowWithNullCount, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getActiveSubscription(COMPANY_ID);

      expect(result?.failedPaymentsCount).toBe(0);
    });

    it('falls back to currentPeriodEnd when nextBillingTime is missing for bank transfers', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const rowWithoutNextBillingTime = { ...mockDbRow, next_billing_time: null };
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: rowWithoutNextBillingTime, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getActiveSubscription(COMPANY_ID);

      expect(result?.nextBillingTime).toBe('2026-04-01');
    });
  });

  describe('getPaymentHistory', () => {
    it('returns manual bank-transfer payment history for the company', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'manual-pay-1',
              company_id: COMPANY_ID,
              amount: 5000,
              period_start: '2026-03-01',
              period_end: '2026-04-01',
              status: 'approved',
              reviewed_at: '2026-03-02T12:00:00Z',
              created_at: '2026-03-01T10:00:00Z',
            },
            {
              id: 'manual-pay-2',
              company_id: COMPANY_ID,
              amount: 7000,
              period_start: '2026-04-01',
              period_end: '2026-05-01',
              status: 'rejected',
              reviewed_at: null,
              created_at: '2026-04-02T10:00:00Z',
            },
          ],
          error: null,
        }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getPaymentHistory(COMPANY_ID, 5);

      expect(fromMock).toHaveBeenCalledWith('manual_payments');
      expect(chainMock.eq).toHaveBeenCalledWith('company_id', COMPANY_ID);
      expect(result).toEqual([
        {
          id: 'manual-pay-1',
          subscriptionId: null,
          companyId: COMPANY_ID,
          transactionId: 'manual-pay-1',
          grossAmount: 5000,
          feeAmount: null,
          netAmount: 5000,
          currency: 'ARS',
          status: 'approved',
          paidAt: '2026-03-02T12:00:00Z',
          createdAt: '2026-03-01T10:00:00Z',
        },
        {
          id: 'manual-pay-2',
          subscriptionId: null,
          companyId: COMPANY_ID,
          transactionId: 'manual-pay-2',
          grossAmount: 7000,
          feeAmount: null,
          netAmount: 7000,
          currency: 'ARS',
          status: 'rejected',
          paidAt: '2026-04-02T10:00:00Z',
          createdAt: '2026-04-02T10:00:00Z',
        },
      ]);
    });

    it('does not query legacy payment_transactions for payment history', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      await getPaymentHistory(COMPANY_ID, 5);

      expect(fromMock).not.toHaveBeenCalledWith('payment_transactions');
    });
  });
});
