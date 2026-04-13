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

  it('returns only payment_transactions with status completed', async () => {
    // The function makes two separate .from() calls:
    // 1. manual_payments (approved)
    // 2. companies (for name lookup if any manual payments)
    // 3. payment_transactions (completed)
    // Since we return no manual payments, only the completed transaction should appear.

    const txChain = makeChain({
      limit: vi.fn().mockResolvedValue({
        data: [
          { id: 'tx-1', gross_amount: 7000, created_at: '2026-03-10T10:00:00Z', status: 'completed' },
        ],
        error: null,
      }),
    });

    const manualChain = makeChain({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') {
        callCount++;
        // First call: manual_payments fetch — no rows
        return manualChain;
      }
      if (table === 'payment_transactions') {
        return txChain;
      }
      return makeChain();
    });

    const result = await getRecentSales(10);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx-1');
    expect(result[0].amount).toBe(7000);
    expect(result[0].status).toBe('approved');
    expect(result[0].paymentMethod).toBe('card');
  });

  it('excludes payment_transactions that are not completed', async () => {
    // payment_transactions query already filters by status='completed' at the DB level,
    // so if no rows match, nothing is returned.
    const txChain = makeChain({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const manualChain = makeChain({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') return manualChain;
      if (table === 'payment_transactions') return txChain;
      return makeChain();
    });

    const result = await getRecentSales(10);

    expect(result).toHaveLength(0);
    expect(txChain.in).toHaveBeenCalledWith('status', ['approved', 'completed']);
  });

  it('includes approved manual payments alongside completed transactions', async () => {
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

    const txChain = makeChain({
      limit: vi.fn().mockResolvedValue({
        data: [
          { id: 'tx-2', gross_amount: 3000, created_at: '2026-03-01T08:00:00Z', status: 'completed' },
        ],
        error: null,
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') return manualChain;
      if (table === 'companies') return companiesChain;
      if (table === 'payment_transactions') return txChain;
      return makeChain();
    });

    const result = await getRecentSales(10);

    expect(result).toHaveLength(2);

    const manualSale = result.find((r) => r.id === 'pay-1');
    expect(manualSale).toBeDefined();
    expect(manualSale?.companyName).toBe('Escuela N°42');
    expect(manualSale?.status).toBe('approved');
    expect(manualSale?.paymentMethod).toBe('bank_transfer');

    const txSale = result.find((r) => r.id === 'tx-2');
    expect(txSale).toBeDefined();
    expect(txSale?.amount).toBe(3000);
    expect(txSale?.status).toBe('approved');
    expect(txSale?.paymentMethod).toBe('card');
  });

  it('sorts results by date descending', async () => {
    const manualChain = makeChain({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const txChain = makeChain({
      limit: vi.fn().mockResolvedValue({
        data: [
          { id: 'tx-old', gross_amount: 1000, created_at: '2026-01-01T00:00:00Z', status: 'completed' },
          { id: 'tx-new', gross_amount: 2000, created_at: '2026-03-15T00:00:00Z', status: 'completed' },
        ],
        error: null,
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'manual_payments') return manualChain;
      if (table === 'payment_transactions') return txChain;
      return makeChain();
    });

    const result = await getRecentSales(10);

    expect(result[0].id).toBe('tx-new');
    expect(result[1].id).toBe('tx-old');
  });

  it('returns empty array when there are no sales at all', async () => {
    const emptyChain = makeChain({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockFrom.mockReturnValue(emptyChain);

    const result = await getRecentSales(10);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
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
