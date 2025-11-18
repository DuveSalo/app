// Fire extinguisher control types

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
  id: string;
  companyId: string;

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
  visibilityObstructed: 'Sí' | 'No';
  accessObstructed: 'Sí' | 'No';

  // Señalización
  signageCondition: string;
  signageFloor: 'Sí' | 'No' | 'N/A';
  signageWall: 'Sí' | 'No' | 'N/A';
  signageHeight: 'Sí' | 'No' | 'N/A';

  // Gabinete
  glassCondition: 'Sí' | 'No' | 'N/A';
  doorOpensEasily: 'Sí' | 'No' | 'N/A';
  cabinetClean: 'Sí' | 'No' | 'N/A';

  // Observaciones
  observations: string;

  createdAt?: string;
  updatedAt?: string;
}
