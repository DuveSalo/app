import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCertificates, getCertificateById, createCertificate, deleteCertificate } from './certificate';

vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
      }),
    },
    functions: { invoke: vi.fn() },
    from: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'company-123/file.pdf' }, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
  },
}));

vi.mock('./context', () => ({
  getAuthenticatedCompanyId: vi.fn().mockResolvedValue('company-123'),
}));

import { supabase } from '../../supabase/client';

const COMPANY_ID = 'company-123';

const mockDbRow = {
  id: 'cert-1',
  company_id: COMPANY_ID,
  presentation_date: '2026-01-15',
  expiration_date: '2027-01-15',
  intervener: 'Bomberos CABA',
  registration_number: 'REG-001',
  pdf_file_url: 'https://example.com/file.pdf',
  pdf_file_path: 'company-123/file.pdf',
  pdf_file_name: 'certificado.pdf',
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

describe('certificate service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCertificates', () => {
    it('returns mapped certificates for a company', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getCertificates(COMPANY_ID);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cert-1');
      expect(result[0].companyId).toBe(COMPANY_ID);
      expect(result[0].presentationDate).toBe('2026-01-15');
      expect(result[0].expirationDate).toBe('2027-01-15');
      expect(result[0].intervener).toBe('Bomberos CABA');
      expect(fromMock).toHaveBeenCalledWith('conservation_certificates');
    });

    it('returns empty array when no data', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getCertificates(COMPANY_ID);

      expect(result).toEqual([]);
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(getCertificates(COMPANY_ID)).rejects.toThrow();
    });
  });

  describe('getCertificateById', () => {
    it('returns a mapped certificate by id', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbRow, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getCertificateById('cert-1');

      expect(result.id).toBe('cert-1');
      expect(result.registrationNumber).toBe('REG-001');
    });

    it('throws NotFoundError when certificate not found', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(getCertificateById('cert-999')).rejects.toThrow('Certificado no encontrado');
    });
  });

  describe('createCertificate', () => {
    it('creates a certificate without file upload', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbRow, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await createCertificate({
        presentationDate: '2026-01-15',
        expirationDate: '2027-01-15',
        intervener: 'Bomberos CABA',
        registrationNumber: 'REG-001',
      });

      expect(result.id).toBe('cert-1');
      expect(result.intervener).toBe('Bomberos CABA');
      expect(fromMock).toHaveBeenCalledWith('conservation_certificates');
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(
        createCertificate({
          presentationDate: '2026-01-15',
          expirationDate: '2027-01-15',
          intervener: 'Test',
          registrationNumber: 'REG-X',
        }),
      ).rejects.toThrow();
    });
  });

  describe('deleteCertificate', () => {
    it('deletes certificate and cleans up storage', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      // First call: select pdf_file_path
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { pdf_file_path: 'company-123/file.pdf' },
          error: null,
        }),
      };
      // Second call: delete
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      fromMock.mockReturnValueOnce(selectChain).mockReturnValueOnce(deleteChain);

      await expect(deleteCertificate('cert-1')).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith('conservation_certificates');
    });

    it('throws when delete fails', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      };

      fromMock.mockReturnValueOnce(selectChain).mockReturnValueOnce(deleteChain);

      await expect(deleteCertificate('cert-1')).rejects.toThrow();
    });
  });
});
