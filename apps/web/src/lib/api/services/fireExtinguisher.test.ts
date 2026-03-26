import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFireExtinguishers,
  createFireExtinguisher,
  updateFireExtinguisher,
  deleteFireExtinguisher,
} from './fireExtinguisher';

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

vi.mock('./context', () => ({
  getAuthenticatedCompanyId: vi.fn().mockResolvedValue('company-123'),
}));

import { supabase } from '../../supabase/client';

const COMPANY_ID = 'company-123';

const mockDbRow = {
  id: 'fe-1',
  company_id: COMPANY_ID,
  control_date: '2026-03-01',
  extinguisher_number: 'EXT-001',
  type: 'ABC',
  capacity: '5kg',
  class: 'ABC',
  position_number: '1',
  charge_expiration_date: '2027-03-01',
  hydraulic_pressure_expiration_date: '2031-03-01',
  manufacturing_year: '2020',
  tag_color: 'Rojo',
  labels_legible: 'Sí',
  pressure_within_range: 'Sí',
  has_seal_and_safety: 'Sí',
  instructions_legible: 'Sí',
  container_condition: 'Bueno',
  nozzle_condition: 'Bueno',
  visibility_obstructed: 'No',
  access_obstructed: 'No',
  signage_condition: 'Bueno',
  signage_floor: 'N/A',
  signage_wall: 'Sí',
  signage_height: 'Sí',
  glass_condition: 'N/A',
  door_opens_easily: 'N/A',
  cabinet_clean: 'N/A',
  observations: 'Sin observaciones',
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
};

describe('fireExtinguisher service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFireExtinguishers', () => {
    it('returns mapped fire extinguishers', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getFireExtinguishers(COMPANY_ID);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('fe-1');
      expect(result[0].extinguisherNumber).toBe('EXT-001');
      expect(result[0].companyId).toBe(COMPANY_ID);
      expect(fromMock).toHaveBeenCalledWith('fire_extinguishers');
    });

    it('returns empty array when no data', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await getFireExtinguishers(COMPANY_ID);

      expect(result).toEqual([]);
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(getFireExtinguishers(COMPANY_ID)).rejects.toThrow();
    });
  });

  describe('createFireExtinguisher', () => {
    it('creates and returns mapped fire extinguisher', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbRow, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const { id, companyId, createdAt, updatedAt, ...input } = {
        id: 'ignored',
        companyId: 'ignored',
        createdAt: 'ignored',
        updatedAt: 'ignored',
        controlDate: '2026-03-01',
        extinguisherNumber: 'EXT-001',
        type: 'ABC' as const,
        capacity: '5kg' as const,
        class: 'ABC',
        positionNumber: '1',
        chargeExpirationDate: '2027-03-01',
        hydraulicPressureExpirationDate: '2031-03-01',
        manufacturingYear: '2020',
        tagColor: 'Rojo',
        labelsLegible: 'Sí',
        pressureWithinRange: 'Sí',
        hasSealAndSafety: 'Sí',
        instructionsLegible: 'Sí',
        containerCondition: 'Bueno',
        nozzleCondition: 'Bueno',
        visibilityObstructed: 'No' as const,
        accessObstructed: 'No' as const,
        signageCondition: 'Bueno',
        signageFloor: 'N/A' as const,
        signageWall: 'Sí' as const,
        signageHeight: 'Sí' as const,
        glassCondition: 'N/A' as const,
        doorOpensEasily: 'N/A' as const,
        cabinetClean: 'N/A' as const,
        observations: 'Sin observaciones',
      };

      const result = await createFireExtinguisher(input);

      expect(result.id).toBe('fe-1');
      expect(result.extinguisherNumber).toBe('EXT-001');
      expect(fromMock).toHaveBeenCalledWith('fire_extinguishers');
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(createFireExtinguisher({} as any)).rejects.toThrow();
    });
  });

  describe('updateFireExtinguisher', () => {
    it('updates and returns mapped fire extinguisher', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbRow, error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      const result = await updateFireExtinguisher({
        id: 'fe-1',
        companyId: COMPANY_ID,
        controlDate: '2026-03-01',
        extinguisherNumber: 'EXT-001',
        type: 'ABC' as any,
        capacity: '5kg' as any,
        class: 'ABC',
        positionNumber: '1',
        chargeExpirationDate: '2027-03-01',
        hydraulicPressureExpirationDate: '2031-03-01',
        manufacturingYear: '2020',
        tagColor: 'Rojo',
        labelsLegible: 'Sí',
        pressureWithinRange: 'Sí',
        hasSealAndSafety: 'Sí',
        instructionsLegible: 'Sí',
        containerCondition: 'Bueno',
        nozzleCondition: 'Bueno',
        visibilityObstructed: 'No' as any,
        accessObstructed: 'No' as any,
        signageCondition: 'Bueno',
        signageFloor: 'N/A' as any,
        signageWall: 'Sí' as any,
        signageHeight: 'Sí' as any,
        glassCondition: 'N/A' as any,
        doorOpensEasily: 'N/A' as any,
        cabinetClean: 'N/A' as any,
        observations: 'Updated',
      });

      expect(result.id).toBe('fe-1');
      expect(fromMock).toHaveBeenCalledWith('fire_extinguishers');
    });
  });

  describe('deleteFireExtinguisher', () => {
    it('deletes without error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(deleteFireExtinguisher('fe-1')).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith('fire_extinguishers');
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      };
      fromMock.mockReturnValue(chainMock);

      await expect(deleteFireExtinguisher('fe-1')).rejects.toThrow();
    });
  });
});
