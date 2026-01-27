import { ChangeEvent } from 'react';
import { ExtinguisherType, ExtinguisherCapacity } from '../../types/index';

export type YesNo = 'Sí' | 'No';
export type YesNoNA = 'Sí' | 'No' | 'N/A';

export interface FireExtinguisherFormData {
  controlDate: string;
  extinguisherNumber: string;
  type: ExtinguisherType;
  capacity: ExtinguisherCapacity;
  class: string;
  positionNumber: string;
  chargeExpirationDate: string;
  hydraulicPressureExpirationDate: string;
  manufacturingYear: string;
  tagColor: string;
  labelsLegible: boolean;
  pressureWithinRange: boolean;
  hasSealAndSafety: boolean;
  instructionsLegible: boolean;
  containerCondition: string;
  nozzleCondition: string;
  visibilityObstructed: YesNo;
  accessObstructed: YesNo;
  signageCondition: string;
  signageFloor: YesNoNA;
  signageWall: YesNoNA;
  signageHeight: YesNoNA;
  glassCondition: YesNoNA;
  doorOpensEasily: YesNoNA;
  cabinetClean: YesNoNA;
  observations: string;
}

export interface SectionProps {
  formData: FireExtinguisherFormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCheckChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface ValidationStatus {
  isIdentificationComplete: boolean;
  isLocationComplete: boolean;
  isConditionsComplete: boolean;
  isCabinetComplete: boolean;
  isAccessibilityComplete: boolean;
  isSignageComplete: boolean;
  isFormComplete: boolean;
}

export const createInitialFormState = (): FireExtinguisherFormData => ({
  controlDate: '',
  extinguisherNumber: '',
  type: '' as ExtinguisherType,
  capacity: '' as ExtinguisherCapacity,
  class: '',
  positionNumber: '',
  chargeExpirationDate: '',
  hydraulicPressureExpirationDate: '',
  manufacturingYear: '',
  tagColor: '',
  labelsLegible: false,
  pressureWithinRange: false,
  hasSealAndSafety: false,
  instructionsLegible: false,
  containerCondition: '',
  nozzleCondition: '',
  visibilityObstructed: '' as YesNo,
  accessObstructed: '' as YesNo,
  signageCondition: '',
  signageFloor: '' as YesNoNA,
  signageWall: '' as YesNoNA,
  signageHeight: '' as YesNoNA,
  glassCondition: '' as YesNoNA,
  doorOpensEasily: '' as YesNoNA,
  cabinetClean: '' as YesNoNA,
  observations: '',
});
