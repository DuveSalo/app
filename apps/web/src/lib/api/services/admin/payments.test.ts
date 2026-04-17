import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentSales, getPendingPayments, approvePayment, rejectPayment } from './payments';

vi.mock('../../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

vi.mock('../../../../constants/plans', () => ({
  formatPlanName: (key: string | null | undefined) => {
    const names: Record<string, string> = {
      basic: 'Básico',
      standard: 'Estándar',
      premium: 'Premium',
    };
    if (!key) return 'Sin plan';
    return names[key] ?? key;
  },
}));

import { supabase } from '../../../supabase/client';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

function makeChain(overrides: Record<string, unknown> = {}) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
  return chain;
}

describe('getRecentSales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns approved manual bank-transfer payments only', async () => {
    const manualRows = [
      {
        id: 'pay-1',
        company_id: 'comp-1',
        amount: 5000,
        period_start: '2026-03-01',
        period_end: '2026-04-01',
        status: 'approved',
        created_at: '2026-03-04T09:00:00Z',
        reviewed_at: '2026-03-05T09:00:00Z',
        rejection_reason: null,
        receipt_url: 'receipts/pay-1.pdf',
      },
    ];
    const manualChain = makeChain({
      limit: vi.fn().mockResolvedValue({ data: manualRows, error: null }),
    });

    const companiesChain = makeChain({
      in: vi.fn().mockResolvedValue({
        data: [{ id: 'comp-1', name: 'Escuela N°42' }],
        error: null,
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') return manualChain;
      if (table === 'companies') return companiesChain;
      throw new Error(`Unexpected table query: ${table}`);
    });

    const result = await getRecentSales(10);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'pay-1',
      companyName: 'Escuela N°42',
      amount: 5000,
      status: 'approved',
      createdAt: '2026-03-05T09:00:00Z',
      paymentMethod: 'bank_transfer',
    });
    expect(manualChain.eq).toHaveBeenCalledWith('status', 'approved');
    expect(manualChain.order).toHaveBeenCalledWith('reviewed_at', { ascending: false });
    expect(mockFrom).not.toHaveBeenCalledWith('payment_transactions');
  });

  it('uses created_at as fallback date when approved payment has no reviewed_at', async () => {
    const manualRows = [
      {
        id: 'pay-no-review',
        company_id: 'comp-1',
        amount: 5000,
        period_start: '2026-03-01',
        period_end: '2026-04-01',
        status: 'approved',
        created_at: '2026-03-04T09:00:00Z',
        reviewed_at: null,
        rejection_reason: null,
        receipt_url: null,
      },
    ];
    const manualChain = makeChain({
      limit: vi.fn().mockResolvedValue({ data: manualRows, error: null }),
    });

    const companiesChain = makeChain({
      in: vi.fn().mockResolvedValue({ data: [{ id: 'comp-1', name: 'Escuela N°42' }], error: null }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') return manualChain;
      if (table === 'companies') return companiesChain;
      throw new Error(`Unexpected table query: ${table}`);
    });

    const result = await getRecentSales(10);

    expect(result[0].createdAt).toBe('2026-03-04T09:00:00Z');
  });

  it('returns empty array when there are no approved manual payments', async () => {
    const emptyChain = makeChain({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') return emptyChain;
      throw new Error(`Unexpected table query: ${table}`);
    });

    const result = await getRecentSales(10);

    expect(result).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalledWith('payment_transactions');
  });
});

describe('getPendingPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only payments with status pending', async () => {
    const pendingRows = [
      {
        id: 'pay-pending-1',
        company_id: 'comp-1',
        amount: 5000,
        period_start: '2026-03-01',
        period_end: '2026-04-01',
        status: 'pending',
        created_at: '2026-03-01T10:00:00Z',
        rejection_reason: null,
        receipt_url: 'receipts/file.pdf',
      },
    ];

    const pendingChain = makeChain({
      order: vi.fn().mockResolvedValue({ data: pendingRows, error: null }),
    });

    const companiesChain = makeChain({
      in: vi.fn().mockResolvedValue({
        data: [{ id: 'comp-1', name: 'Escuela N°42' }],
        error: null,
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') return pendingChain;
      if (table === 'companies') return companiesChain;
      return makeChain();
    });

    const result = await getPendingPayments();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pay-pending-1');
    expect(result[0].status).toBe('pending');
    expect(result[0].companyName).toBe('Escuela N°42');
    // Verify only pending are queried
    expect(pendingChain.eq).toHaveBeenCalledWith('status', 'pending');
  });

  it('returns empty array when there are no pending payments', async () => {
    const emptyChain = makeChain({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockFrom.mockReturnValue(emptyChain);

    const result = await getPendingPayments();

    expect(result).toHaveLength(0);
  });

  it('uses Desconocido as company name when company is not found', async () => {
    const pendingRows = [
      {
        id: 'pay-2',
        company_id: 'comp-unknown',
        amount: 3000,
        period_start: '2026-03-01',
        period_end: '2026-04-01',
        status: 'pending',
        created_at: '2026-03-01T10:00:00Z',
        rejection_reason: null,
        receipt_url: null,
      },
    ];

    const pendingChain = makeChain({
      order: vi.fn().mockResolvedValue({ data: pendingRows, error: null }),
    });

    const companiesChain = makeChain({
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') return pendingChain;
      if (table === 'companies') return companiesChain;
      return makeChain();
    });

    const result = await getPendingPayments();

    expect(result[0].companyName).toBe('Desconocido');
  });
});

describe('approvePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls admin_approve_payment RPC with correct params', async () => {
    const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'admin@test.com' } },
    });

    const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;
    mockRpc.mockResolvedValue({ error: null });

    await approvePayment('pay-1');

    expect(mockRpc).toHaveBeenCalledWith('admin_approve_payment', {
      p_payment_id: 'pay-1',
      p_admin_id: 'admin-1',
      p_admin_email: 'admin@test.com',
    });
  });

  it('throws when user is not authenticated', async () => {
    const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(approvePayment('pay-1')).rejects.toThrow('No autenticado');
  });

  it('propagates RPC errors', async () => {
    const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'admin@test.com' } },
    });

    const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;
    mockRpc.mockResolvedValue({ error: { message: 'Payment not found', code: 'P0001' } });

    await expect(approvePayment('pay-1')).rejects.toThrow();
  });
});

describe('rejectPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls admin_reject_payment RPC with correct params', async () => {
    const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'admin@test.com' } },
    });

    const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;
    mockRpc.mockResolvedValue({ error: null });

    await rejectPayment('pay-1', 'Comprobante ilegible');

    expect(mockRpc).toHaveBeenCalledWith('admin_reject_payment', {
      p_payment_id: 'pay-1',
      p_admin_id: 'admin-1',
      p_admin_email: 'admin@test.com',
      p_reason: 'Comprobante ilegible',
    });
  });

  it('passes null reason when reason is empty string', async () => {
    const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'admin@test.com' } },
    });

    const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;
    mockRpc.mockResolvedValue({ error: null });

    await rejectPayment('pay-1', '');

    expect(mockRpc).toHaveBeenCalledWith('admin_reject_payment', expect.objectContaining({
      p_reason: undefined,
    }));
  });

  it('throws when user is not authenticated', async () => {
    const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(rejectPayment('pay-1', 'reason')).rejects.toThrow('No autenticado');
  });
});
