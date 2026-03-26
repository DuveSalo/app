import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitBankTransferPayment, getLatestManualPayment } from './bankTransfer';

vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
      }),
    },
    functions: { invoke: vi.fn() },
    from: vi.fn(),
    rpc: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
  },
}));

import { supabase } from '../../supabase/client';

const COMPANY_ID = 'company-123';

const mockPaymentRow = {
  id: 'pay-1',
  company_id: COMPANY_ID,
  amount: 5000,
  period_start: '2026-03-17',
  period_end: '2026-04-17',
  receipt_url: null,
  receipt_uploaded_at: null,
  status: 'pending',
  rejection_reason: null,
  created_at: '2026-03-17T00:00:00Z',
};

describe('bankTransfer service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitBankTransferPayment', () => {
    it('calls submit_bank_transfer_payment RPC and returns mapped payment', async () => {
      const rpcMock = supabase.rpc as ReturnType<typeof vi.fn>;
      rpcMock.mockResolvedValueOnce({ data: 'pay-1', error: null });

      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPaymentRow, error: null }),
      };
      fromMock.mockReturnValue(selectChain);

      const result = await submitBankTransferPayment({
        companyId: COMPANY_ID,
        planKey: 'basic',
        amount: 5000,
      });

      expect(rpcMock).toHaveBeenCalledWith('submit_bank_transfer_payment', expect.objectContaining({
        p_company_id: COMPANY_ID,
        p_amount: 5000,
        p_plan_key: 'basic',
      }));
      expect(result.id).toBe('pay-1');
      expect(result.companyId).toBe(COMPANY_ID);
      expect(result.amount).toBe(5000);
      expect(result.status).toBe('pending');
    });

    it('throws when RPC fails', async () => {
      const rpcMock = supabase.rpc as ReturnType<typeof vi.fn>;
      rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'RPC failed' } });

      await expect(
        submitBankTransferPayment({ companyId: COMPANY_ID, planKey: 'basic', amount: 5000 }),
      ).rejects.toThrow();
    });

    it('throws when post-RPC fetch fails', async () => {
      const rpcMock = supabase.rpc as ReturnType<typeof vi.fn>;
      rpcMock.mockResolvedValueOnce({ data: 'pay-1', error: null });

      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch failed' } }),
      };
      fromMock.mockReturnValue(selectChain);

      await expect(
        submitBankTransferPayment({ companyId: COMPANY_ID, planKey: 'basic', amount: 5000 }),
      ).rejects.toThrow();
    });
  });

  describe('getLatestManualPayment', () => {
    it('returns mapped payment when one exists', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockPaymentRow, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getLatestManualPayment(COMPANY_ID);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('pay-1');
      expect(result?.amount).toBe(5000);
      expect(result?.status).toBe('pending');
      expect(fromMock).toHaveBeenCalledWith('manual_payments');
    });

    it('returns null when no payment exists', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getLatestManualPayment(COMPANY_ID);

      expect(result).toBeNull();
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'DB error' },
        }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(getLatestManualPayment(COMPANY_ID)).rejects.toThrow();
    });
  });
});
