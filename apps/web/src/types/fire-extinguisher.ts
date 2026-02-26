// Fire extinguisher control types

import { YesNo, YesNoNA } from './common';

export enum ExtinguisherType {
  DRY_CHEMICAL = 'Polvo Químico Seco (PQS)',
  CARBON_DIOXIDE = 'Dióxido de Carbono (CO₂)',
  HALON = 'Halón',
  POTASSIUM_ACETATE = 'Acetato de Potasio (AcK)',
  WATER = 'Agua (H₂O)',
  FOAM = 'Espuma (AFFF)',
}

export enum ExtinguisherCapacity {
  SMALL = '3.5',
  MEDIUM = '5',
  LARGE = '10',
}

export interface FireExtinguisherControl {
  readonly id: string;
  readonly companyId: string;

  // Fecha de Control
  controlDate: string;

  // Identificación
  extinguisherNumber: string;
  type: ExtinguisherType;
  capacity: ExtinguisherCapacity;
  class: string;

  // Ubicación e Información
  positionNumber: string;
  chargeExpirationDate: string;
  hydraulicPressureExpirationDate: string;
  manufacturingYear: string;
  tagColor: string;

  // Condiciones Controladas
  labelsLegible: boolean;
  pressureWithinRange: boolean;
  hasSealAndSafety: boolean;
  instructionsLegible: boolean;
  containerCondition: string;
  nozzleCondition: string;

  // Accesibilidad
  visibilityObstructed: YesNo;
  accessObstructed: YesNo;

  // Señalización
  signageCondition: string;
  signageFloor: YesNoNA;
  signageWall: YesNoNA;
  signageHeight: YesNoNA;

  // Gabinete
  glassCondition: YesNoNA;
  doorOpensEasily: YesNoNA;
  cabinetClean: YesNoNA;

  // Observaciones
  observations: string;

  readonly createdAt?: string;
  readonly updatedAt?: string;
}
