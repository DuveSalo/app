import { describe, it, expect } from 'vitest';
import { fireExtinguisherSchema } from './schemas';
import { ExtinguisherType, ExtinguisherCapacity } from '../../types/fire-extinguisher';

const validExtinguisher = {
  // Identification
  controlDate: '2026-03-15',
  extinguisherNumber: 'EXT-001',
  type: ExtinguisherType.DRY_CHEMICAL,
  capacity: ExtinguisherCapacity.MEDIUM,
  class: 'ABC',

  // Location
  positionNumber: 'P-01',
  chargeExpirationDate: '2027-03-15',
  hydraulicPressureExpirationDate: '2031-03-15',
  manufacturingYear: '2020',
  tagColor: 'Rojo',

  // Conditions
  labelsLegible: true,
  pressureWithinRange: true,
  hasSealAndSafety: true,
  instructionsLegible: true,
  containerCondition: 'Bueno',
  nozzleCondition: 'Bueno',

  // Cabinet
  glassCondition: 'Sí' as const,
  doorOpensEasily: 'No' as const,
  cabinetClean: 'N/A' as const,

  // Accessibility
  visibilityObstructed: 'No' as const,
  accessObstructed: 'No' as const,

  // Signage
  signageCondition: 'Bueno',
  signageFloor: 'Sí' as const,
  signageWall: 'Sí' as const,
  signageHeight: 'N/A' as const,

  // Observations
  observations: '',
};

describe('fireExtinguisherSchema', () => {
  it('should accept valid data', () => {
    const result = fireExtinguisherSchema.safeParse(validExtinguisher);
    expect(result.success).toBe(true);
  });

  it('should accept observations as empty string', () => {
    const result = fireExtinguisherSchema.safeParse({ ...validExtinguisher, observations: '' });
    expect(result.success).toBe(true);
  });

  it('should accept observations with text', () => {
    const result = fireExtinguisherSchema.safeParse({
      ...validExtinguisher,
      observations: 'Se observó leve corrosión en la base.',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing controlDate', () => {
    const { controlDate: _, ...data } = validExtinguisher;
    const result = fireExtinguisherSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject missing extinguisherNumber', () => {
    const { extinguisherNumber: _, ...data } = validExtinguisher;
    const result = fireExtinguisherSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format', () => {
    const result = fireExtinguisherSchema.safeParse({
      ...validExtinguisher,
      controlDate: '15/03/2026',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid extinguisher type', () => {
    const result = fireExtinguisherSchema.safeParse({
      ...validExtinguisher,
      type: 'InvalidType',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid extinguisher capacity', () => {
    const result = fireExtinguisherSchema.safeParse({
      ...validExtinguisher,
      capacity: '99',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid cabinet enum value', () => {
    const result = fireExtinguisherSchema.safeParse({
      ...validExtinguisher,
      glassCondition: 'Maybe',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid accessibility enum value', () => {
    const result = fireExtinguisherSchema.safeParse({
      ...validExtinguisher,
      visibilityObstructed: 'N/A',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty required string fields', () => {
    const result = fireExtinguisherSchema.safeParse({
      ...validExtinguisher,
      containerCondition: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing boolean fields', () => {
    const { labelsLegible: _, ...data } = validExtinguisher;
    const result = fireExtinguisherSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
