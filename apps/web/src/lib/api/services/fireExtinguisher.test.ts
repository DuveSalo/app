import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFireExtinguishers,
  createFireExtinguisher,
  updateFireExtinguisher,
  deleteFireExtinguisher,
} from './fireExtinguisher';
import { ExtinguisherType, ExtinguisherCapacity } from '../../../types';
import type { Tables } from '../../../types/database.types';

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

type CreateFireExtinguisherInput = Parameters<typeof createFireExtinguisher>[0];
type UpdateFireExtinguisherInput = Parameters<typeof updateFireExtinguisher>[0];

const createInput: CreateFireExtinguisherInput = {
  controlDate: '2026-03-01',
  extinguisherNumber: 'EXT-001',
  type: ExtinguisherType.DRY_CHEMICAL,
  capacity: ExtinguisherCapacity.MEDIUM,
  class: 'ABC',
  positionNumber: '1',
  chargeExpirationDate: '2027-03-01',
  hydraulicPressureExpirationDate: '2031-03-01',
  manufacturingYear: '2020',
  tagColor: 'Rojo',
  labelsLegible: true,
  pressureWithinRange: true,
  hasSealAndSafety: true,
  instructionsLegible: true,
  containerCondition: 'Bueno',
  nozzleCondition: 'Bueno',
  visibilityObstructed: 'No',
  accessObstructed: 'No',
  signageCondition: 'Bueno',
  signageFloor: 'N/A',
  signageWall: 'Sí',
  signageHeight: 'Sí',
  glassCondition: 'N/A',
  doorOpensEasily: 'N/A',
  cabinetClean: 'N/A',
  observations: 'Sin observaciones',
};

const updateInput: UpdateFireExtinguisherInput = {
  id: 'fe-1',
  companyId: COMPANY_ID,
  ...createInput,
  observations: 'Updated',
};

const mockDbRow: Tables<'fire_extinguishers'> = {
  id: 'fe-1',
  company_id: COMPANY_ID,
  control_date: createInput.controlDate,
  extinguisher_number: createInput.extinguisherNumber,
  type: createInput.type,
  capacity: createInput.capacity,
  class: createInput.class,
  position_number: createInput.positionNumber,
  charge_expiration_date: createInput.chargeExpirationDate,
  hydraulic_pressure_expiration_date: createInput.hydraulicPressureExpirationDate,
  manufacturing_year: createInput.manufacturingYear,
  tag_color: createInput.tagColor,
  labels_legible: createInput.labelsLegible,
  pressure_within_range: createInput.pressureWithinRange,
  has_seal_and_safety: createInput.hasSealAndSafety,
  instructions_legible: createInput.instructionsLegible,
  container_condition: createInput.containerCondition,
  nozzle_condition: createInput.nozzleCondition,
  visibility_obstructed: createInput.visibilityObstructed,
  access_obstructed: createInput.accessObstructed,
  signage_condition: createInput.signageCondition,
  signage_floor: createInput.signageFloor,
  signage_wall: createInput.signageWall,
  signage_height: createInput.signageHeight,
  glass_condition: createInput.glassCondition,
  door_opens_easily: createInput.doorOpensEasily,
  cabinet_clean: createInput.cabinetClean,
  observations: createInput.observations,
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

      const result = await createFireExtinguisher(createInput);

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

      await expect(createFireExtinguisher({} as CreateFireExtinguisherInput)).rejects.toThrow();
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

      const result = await updateFireExtinguisher(updateInput);

      expect(result.id).toBe('fe-1');
      expect(fromMock).toHaveBeenCalledWith('fire_extinguishers');
    });
  });

  describe('deleteFireExtinguisher', () => {
    it('deletes without error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn(),
      };
      chainMock.eq.mockReturnValueOnce(chainMock).mockResolvedValueOnce({ error: null });
      fromMock.mockReturnValue(chainMock);

      await expect(deleteFireExtinguisher('fe-1')).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith('fire_extinguishers');
      expect(chainMock.eq).toHaveBeenNthCalledWith(1, 'id', 'fe-1');
      expect(chainMock.eq).toHaveBeenNthCalledWith(2, 'company_id', COMPANY_ID);
    });

    it('throws when supabase returns an error', async () => {
      const fromMock = supabase.from as ReturnType<typeof vi.fn>;
      const chainMock = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn(),
      };
      chainMock.eq
        .mockReturnValueOnce(chainMock)
        .mockResolvedValueOnce({ error: { message: 'Delete failed' } });
      fromMock.mockReturnValue(chainMock);

      await expect(deleteFireExtinguisher('fe-1')).rejects.toThrow();
    });
  });
});
