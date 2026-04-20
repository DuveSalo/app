import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '../../../supabase/client';
import { deleteSchool, getAllSchools, getRecentRegistrations, getSchoolDetail } from './schools';

// ---------------------------------------------------------------------------
// Helpers to build Supabase query chain mocks
// ---------------------------------------------------------------------------

/** Builds a mock chain for: .from().select().order().limit() → used by getRecentRegistrations */
function mockFromSelectOrderLimit(resolvedValue: { data: unknown; error: null | object }) {
  const limitMock = vi.fn().mockResolvedValue(resolvedValue);
  const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
  const selectMock = vi.fn().mockReturnValue({ order: orderMock });
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectMock });
  return { selectMock, orderMock, limitMock };
}

/** Builds a mock chain for: .from().select().order() → used by getAllSchools */
function mockFromSelectOrder(resolvedValue: { data: unknown; error: null | object }) {
  const orderMock = vi.fn().mockResolvedValue(resolvedValue);
  const selectMock = vi.fn().mockReturnValue({ order: orderMock });
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectMock });
  return { selectMock, orderMock };
}

/** Builds a mock chain for: .from().select().eq().single() → used by getSchoolDetail */
function mockFromSelectEqSingle(resolvedValue: { data: unknown; error: null | object }) {
  const singleMock = vi.fn().mockResolvedValue(resolvedValue);
  const eqMock = vi.fn().mockReturnValue({ single: singleMock });
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: selectMock });
  return { selectMock, eqMock, singleMock };
}

// ---------------------------------------------------------------------------
// deleteSchool
// ---------------------------------------------------------------------------

describe('deleteSchool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes the admin-delete-school edge function with the companyId', async () => {
    const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>;
    invokeMock.mockResolvedValue({ data: { success: true }, error: null });

    await deleteSchool('company-123');

    expect(invokeMock).toHaveBeenCalledWith('admin-delete-school', {
      body: { companyId: 'company-123' },
    });
  });

  it('resolves without error on success', async () => {
    const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>;
    invokeMock.mockResolvedValue({ data: { success: true }, error: null });

    await expect(deleteSchool('company-abc')).resolves.toBeUndefined();
  });

  it('throws when the edge function returns an error', async () => {
    const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>;
    invokeMock.mockResolvedValue({
      data: null,
      error: { message: 'Error al eliminar la escuela' },
    });

    await expect(deleteSchool('company-456')).rejects.toThrow('Error al eliminar la escuela');
  });

  it('does not call supabase.from (no direct DB operations)', async () => {
    const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>;
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    invokeMock.mockResolvedValue({ data: { success: true }, error: null });

    await deleteSchool('company-789');

    expect(fromMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getAllSchools — payment_method nullability
// ---------------------------------------------------------------------------

describe('getAllSchools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps paymentMethod to null when payment_method is null in the DB row', async () => {
    mockFromSelectOrder({
      data: [
        {
          id: 'school-1',
          name: 'Escuela A',
          city: 'Buenos Aires',
          province: 'CABA',
          selected_plan: 'basic',
          subscription_status: 'active',
          trial_ends_at: null,
          created_at: '2026-01-01T00:00:00Z',
          payment_method: null,
          employees: [{ email: 'admin@school.com', role: 'Administrador' }],
        },
      ],
      error: null,
    });

    const rows = await getAllSchools();

    expect(rows).toHaveLength(1);
    expect(rows[0].paymentMethod).toBeNull();
  });

  it("maps paymentMethod to 'bank_transfer' when payment_method is 'bank_transfer'", async () => {
    mockFromSelectOrder({
      data: [
        {
          id: 'school-2',
          name: 'Escuela B',
          city: 'Córdoba',
          province: 'Córdoba',
          selected_plan: 'basic',
          subscription_status: 'active',
          trial_ends_at: null,
          created_at: '2026-02-01T00:00:00Z',
          payment_method: 'bank_transfer',
          employees: [{ email: 'admin@schoolb.com', role: 'Administrador' }],
        },
      ],
      error: null,
    });

    const rows = await getAllSchools();

    expect(rows).toHaveLength(1);
    expect(rows[0].paymentMethod).toBe('bank_transfer');
  });
});

// ---------------------------------------------------------------------------
// getRecentRegistrations — payment_method nullability
// ---------------------------------------------------------------------------

describe('getRecentRegistrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps paymentMethod to null when payment_method is null in the DB row', async () => {
    mockFromSelectOrderLimit({
      data: [
        {
          id: 'school-3',
          name: 'Escuela C',
          city: 'Rosario',
          province: 'Santa Fe',
          selected_plan: 'basic',
          subscription_status: 'trial',
          trial_ends_at: null,
          created_at: '2026-03-01T00:00:00Z',
          payment_method: null,
          employees: [],
        },
      ],
      error: null,
    });

    const rows = await getRecentRegistrations();

    expect(rows).toHaveLength(1);
    expect(rows[0].paymentMethod).toBeNull();
  });

  it("maps paymentMethod to 'bank_transfer' when payment_method is 'bank_transfer'", async () => {
    mockFromSelectOrderLimit({
      data: [
        {
          id: 'school-4',
          name: 'Escuela D',
          city: 'Mendoza',
          province: 'Mendoza',
          selected_plan: 'basic',
          subscription_status: 'active',
          trial_ends_at: null,
          created_at: '2026-04-01T00:00:00Z',
          payment_method: 'bank_transfer',
          employees: [{ email: 'owner@schoold.com', role: 'Administrador' }],
        },
      ],
      error: null,
    });

    const rows = await getRecentRegistrations();

    expect(rows).toHaveLength(1);
    expect(rows[0].paymentMethod).toBe('bank_transfer');
  });
});

// ---------------------------------------------------------------------------
// getSchoolDetail — payment_method nullability
// ---------------------------------------------------------------------------

describe('getSchoolDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps paymentMethod to null when payment_method is null in the DB row', async () => {
    mockFromSelectEqSingle({
      data: {
        id: 'school-5',
        name: 'Escuela E',
        cuit: '20-12345678-9',
        address: 'Calle Falsa 123',
        city: 'La Plata',
        province: 'Buenos Aires',
        locality: 'La Plata',
        postal_code: '1900',
        phone: '0221-123456',
        selected_plan: 'basic',
        subscription_status: 'trial',
        payment_method: null,
        bank_transfer_status: null,
        is_subscribed: false,
        trial_ends_at: null,
        subscription_renewal_date: null,
        created_at: '2026-01-15T00:00:00Z',
        services: null,
        employees: [
          { id: 'emp-1', name: 'Ana García', email: 'ana@school.com', role: 'Administrador' },
        ],
      },
      error: null,
    });

    const detail = await getSchoolDetail('school-5');

    expect(detail.paymentMethod).toBeNull();
  });

  it("maps paymentMethod to 'bank_transfer' when payment_method is 'bank_transfer'", async () => {
    mockFromSelectEqSingle({
      data: {
        id: 'school-6',
        name: 'Escuela F',
        cuit: '20-87654321-0',
        address: 'Avenida Siempre Viva 742',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        locality: 'Mar del Plata',
        postal_code: '7600',
        phone: '0223-654321',
        selected_plan: 'pro',
        subscription_status: 'active',
        payment_method: 'bank_transfer',
        bank_transfer_status: 'approved',
        is_subscribed: true,
        trial_ends_at: null,
        subscription_renewal_date: '2026-05-01T00:00:00Z',
        created_at: '2025-05-01T00:00:00Z',
        services: null,
        employees: [
          { id: 'emp-2', name: 'Carlos López', email: 'carlos@school.com', role: 'Administrador' },
        ],
      },
      error: null,
    });

    const detail = await getSchoolDetail('school-6');

    expect(detail.paymentMethod).toBe('bank_transfer');
  });

  it('does not expose stale trial end date once the school is subscribed', async () => {
    mockFromSelectEqSingle({
      data: {
        id: 'school-7',
        name: 'Escuela Activa',
        cuit: '20-87654321-0',
        address: 'Avenida Siempre Viva 742',
        city: '',
        province: 'CABA',
        locality: '',
        postal_code: 'C1000',
        phone: '011-123456',
        selected_plan: 'basic',
        subscription_status: 'active',
        payment_method: 'bank_transfer',
        bank_transfer_status: 'active',
        is_subscribed: true,
        trial_ends_at: '2026-05-01T00:00:00Z',
        subscription_renewal_date: '2026-05-15',
        created_at: '2026-04-01T00:00:00Z',
        services: null,
        employees: [],
      },
      error: null,
    });

    const detail = await getSchoolDetail('school-7');

    expect(detail.trialEndsAt).toBeNull();
    expect(detail.subscriptionRenewalDate).toBe('2026-05-15');
  });
});
