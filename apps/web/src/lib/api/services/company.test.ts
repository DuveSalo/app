import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCompany, getCompanyByUserId, getCompanyIdByUserId, updateCompany } from './company';

vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com', user_metadata: { name: 'Test' } } },
      }),
    },
    functions: { invoke: vi.fn() },
    from: vi.fn(),
  },
}));

vi.mock('./context', () => ({
  getAuthenticatedCompanyId: vi.fn().mockResolvedValue('company-123'),
}));

import { supabase } from '../../supabase/client';

const COMPANY_ID = 'company-123';
const USER_ID = 'user-1';

const mockCompanyRow = {
  id: COMPANY_ID,
  user_id: USER_ID,
  name: 'Escuela Test',
  cuit: '30-12345678-9',
  address: 'Calle 123',
  postal_code: '1000',
  city: 'Buenos Aires',
  locality: 'CABA',
  province: 'Buenos Aires',
  country: 'Argentina',
  rama_key: 'educacion',
  owner_entity: 'Privada',
  phone: '1122334455',
  is_subscribed: false,
  selected_plan: null,
  trial_ends_at: null,
  subscription_status: null,
  subscription_renewal_date: null,
  payment_method: 'mercadopago',
  bank_transfer_status: null,
  services: {},
  payment_methods: [],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
};

describe('company service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCompany', () => {
    const companyInput = {
      name: 'Escuela Test',
      cuit: '30-12345678-9',
      address: 'Calle 123',
      postalCode: '1000',
      city: 'Buenos Aires',
      locality: 'CABA',
      province: 'Buenos Aires',
      country: 'Argentina',
      ramaKey: 'educacion',
      ownerEntity: 'Privada',
      phone: '1122334455',
      services: {},
      paymentMethods: [],
    };

    it('sends the welcome email after creating the company workspace', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>;
      invokeMock.mockResolvedValue({ data: { success: true }, error: null });

      const companyChainMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCompanyRow, error: null }),
      };
      const employeeRow = {
        id: 'emp-1',
        name: 'Test',
        email: 'test@test.com',
        role: 'Administrador',
        company_id: COMPANY_ID,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      const employeeChainMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: employeeRow, error: null }),
      };

      fromMock.mockImplementation((table: string) =>
        table === 'companies' ? companyChainMock : employeeChainMock
      );

      const result = await createCompany(companyInput);

      expect(result.id).toBe(COMPANY_ID);
      expect(result.employees).toHaveLength(1);
      expect(invokeMock).toHaveBeenCalledWith('send-welcome-email', {
        body: { companyId: COMPANY_ID },
      });
    });

    it('does not fail company creation when the welcome email function fails', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const invokeMock = supabase.functions.invoke as ReturnType<typeof vi.fn>;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      invokeMock.mockResolvedValue({ data: null, error: { message: 'Resend unavailable' } });

      const companyChainMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCompanyRow, error: null }),
      };
      const employeeChainMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      fromMock.mockImplementation((table: string) =>
        table === 'companies' ? companyChainMock : employeeChainMock
      );

      try {
        const result = await createCompany(companyInput);

        expect(result.id).toBe(COMPANY_ID);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[company] Welcome email failed:',
          'Resend unavailable'
        );
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('getCompanyIdByUserId', () => {
    it('returns company id for a valid user', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: COMPANY_ID }, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getCompanyIdByUserId(USER_ID);

      expect(result).toBe(COMPANY_ID);
      expect(fromMock).toHaveBeenCalledWith('companies');
      expect(chainMock.eq).toHaveBeenCalledWith('user_id', USER_ID);
    });

    it('throws NotFoundError when no company exists', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(getCompanyIdByUserId(USER_ID)).rejects.toThrow('Empresa no encontrada');
    });
  });

  describe('getCompanyByUserId', () => {
    it('returns mapped company with employees', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const mockEmployees = [
        { id: 'emp-1', name: 'Admin', email: 'admin@test.com', role: 'Administrador' },
      ];
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockCompanyRow, employees: mockEmployees },
          error: null,
        }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getCompanyByUserId(USER_ID);

      expect(result.id).toBe(COMPANY_ID);
      expect(result.name).toBe('Escuela Test');
      expect(result.cuit).toBe('30-12345678-9');
      expect(result.employees).toHaveLength(1);
      expect(result.employees[0].name).toBe('Admin');
      expect(fromMock).toHaveBeenCalledWith('companies');
    });

    it('throws NotFoundError when company not found', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(getCompanyByUserId(USER_ID)).rejects.toThrow('Empresa no encontrada');
    });
  });

  describe('updateCompany', () => {
    it('updates and returns mapped company', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const updatedRow = { ...mockCompanyRow, name: 'Updated School', employees: [] };
      const chainMock = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await updateCompany({ id: COMPANY_ID, name: 'Updated School' });

      expect(result.name).toBe('Updated School');
      expect(fromMock).toHaveBeenCalledWith('companies');
    });

    it('throws when id is missing', async () => {
      await expect(updateCompany({ name: 'No ID' })).rejects.toThrow('ID de empresa requerido');
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(updateCompany({ id: COMPANY_ID, name: 'Fail' })).rejects.toThrow();
    });
  });
});
