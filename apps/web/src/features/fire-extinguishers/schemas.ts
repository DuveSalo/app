import { z } from 'zod';
import { ExtinguisherType, ExtinguisherCapacity } from '../../types/fire-extinguisher';

const yesNoEnum = z.enum(['Sí', 'No']);
const yesNoNAEnum = z.enum(['Sí', 'No', 'N/A']);

export const fireExtinguisherSchema = z.object({
  // Identification tab
  controlDate: z.string().min(1, 'La fecha de control es requerida').max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
  extinguisherNumber: z.string().min(1, 'El número de extintor es requerido').max(50),
  type: z.nativeEnum(ExtinguisherType, { message: 'Seleccione un tipo' }),
  capacity: z.nativeEnum(ExtinguisherCapacity, { message: 'Seleccione una capacidad' }),
  class: z.string().min(1, 'La clase es requerida').max(50),

  // Location tab
  positionNumber: z.string().min(1, 'El número de puesto es requerido').max(50),
  chargeExpirationDate: z.string().min(1, 'La fecha de vencimiento de carga es requerida').max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
  hydraulicPressureExpirationDate: z.string().min(1, 'La fecha de vencimiento de presión hidráulica es requerida').max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
  manufacturingYear: z.string().min(1, 'El año de fabricación es requerido').max(4),
  tagColor: z.string().min(1, 'El color de marbete es requerido').max(50),

  // Conditions tab
  labelsLegible: z.boolean(),
  pressureWithinRange: z.boolean(),
  hasSealAndSafety: z.boolean(),
  instructionsLegible: z.boolean(),
  containerCondition: z.string().min(1, 'El estado del recipiente es requerido').max(50),
  nozzleCondition: z.string().min(1, 'El estado de la tobera es requerido').max(50),

  // Cabinet tab
  glassCondition: yesNoNAEnum,
  doorOpensEasily: yesNoNAEnum,
  cabinetClean: yesNoNAEnum,

  // Accessibility tab
  visibilityObstructed: yesNoEnum,
  accessObstructed: yesNoEnum,

  // Signage tab
  signageCondition: z.string().min(1, 'El estado de señalización es requerido').max(50),
  signageFloor: yesNoNAEnum,
  signageWall: yesNoNAEnum,
  signageHeight: yesNoNAEnum,

  // Observations tab
  observations: z.string().max(2000).or(z.literal('')),
});

export type FireExtinguisherFormValues = z.infer<typeof fireExtinguisherSchema>;

/** Fields per tab for trigger-based validation */
export const IDENTIFICATION_FIELDS = [
  'controlDate',
  'extinguisherNumber',
  'type',
  'capacity',
  'class',
] as const;

export const LOCATION_FIELDS = [
  'positionNumber',
  'chargeExpirationDate',
  'hydraulicPressureExpirationDate',
  'manufacturingYear',
  'tagColor',
] as const;

export const CONDITIONS_FIELDS = [
  'containerCondition',
  'nozzleCondition',
] as const;

export const CABINET_FIELDS = [
  'glassCondition',
  'doorOpensEasily',
  'cabinetClean',
] as const;

export const ACCESSIBILITY_FIELDS = [
  'visibilityObstructed',
  'accessObstructed',
] as const;

export const SIGNAGE_FIELDS = [
  'signageCondition',
  'signageFloor',
  'signageWall',
  'signageHeight',
] as const;

export const TAB_FIELDS = [
  IDENTIFICATION_FIELDS,
  LOCATION_FIELDS,
  CONDITIONS_FIELDS,
  CABINET_FIELDS,
  ACCESSIBILITY_FIELDS,
  SIGNAGE_FIELDS,
] as const;
