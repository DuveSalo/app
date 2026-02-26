import { useMemo, useEffect, useState, useCallback } from 'react';
import { FireExtinguisherFormData, ValidationStatus } from '../types';

interface UseFireExtinguisherValidationResult extends ValidationStatus {
  maxAllowedStep: number;
  canAdvanceFromTab: (tab: number) => boolean;
}

export const useFireExtinguisherValidation = (
  formData: FireExtinguisherFormData
): UseFireExtinguisherValidationResult => {
  const [maxAllowedStep, setMaxAllowedStep] = useState(0);

  const isIdentificationComplete = useMemo(() =>
    !!formData.controlDate &&
    !!formData.extinguisherNumber &&
    !!formData.type &&
    !!formData.capacity &&
    !!formData.class,
    [formData.controlDate, formData.extinguisherNumber, formData.type, formData.capacity, formData.class]
  );

  const isLocationComplete = useMemo(() =>
    !!formData.positionNumber &&
    !!formData.chargeExpirationDate &&
    !!formData.hydraulicPressureExpirationDate &&
    !!formData.manufacturingYear &&
    !!formData.tagColor,
    [formData.positionNumber, formData.chargeExpirationDate, formData.hydraulicPressureExpirationDate, formData.manufacturingYear, formData.tagColor]
  );

  const isConditionsComplete = useMemo(() =>
    !!formData.containerCondition &&
    !!formData.nozzleCondition,
    [formData.containerCondition, formData.nozzleCondition]
  );

  const isCabinetComplete = useMemo(() =>
    !!formData.glassCondition &&
    !!formData.doorOpensEasily &&
    !!formData.cabinetClean,
    [formData.glassCondition, formData.doorOpensEasily, formData.cabinetClean]
  );

  const isAccessibilityComplete = useMemo(() =>
    !!formData.visibilityObstructed &&
    !!formData.accessObstructed,
    [formData.visibilityObstructed, formData.accessObstructed]
  );

  const isSignageComplete = useMemo(() =>
    !!formData.signageCondition &&
    !!formData.signageFloor &&
    !!formData.signageWall &&
    !!formData.signageHeight,
    [formData.signageCondition, formData.signageFloor, formData.signageWall, formData.signageHeight]
  );

  const isFormComplete = useMemo(() =>
    isIdentificationComplete &&
    isLocationComplete &&
    isConditionsComplete &&
    isCabinetComplete &&
    isAccessibilityComplete &&
    isSignageComplete,
    [isIdentificationComplete, isLocationComplete, isConditionsComplete, isCabinetComplete, isAccessibilityComplete, isSignageComplete]
  );

  useEffect(() => {
    if (isIdentificationComplete && isLocationComplete && isConditionsComplete && isCabinetComplete && isAccessibilityComplete && isSignageComplete) {
      setMaxAllowedStep(6);
    } else if (isIdentificationComplete && isLocationComplete && isConditionsComplete && isCabinetComplete && isAccessibilityComplete) {
      setMaxAllowedStep(5);
    } else if (isIdentificationComplete && isLocationComplete && isConditionsComplete && isCabinetComplete) {
      setMaxAllowedStep(4);
    } else if (isIdentificationComplete && isLocationComplete && isConditionsComplete) {
      setMaxAllowedStep(3);
    } else if (isIdentificationComplete && isLocationComplete) {
      setMaxAllowedStep(2);
    } else if (isIdentificationComplete) {
      setMaxAllowedStep(1);
    } else {
      setMaxAllowedStep(0);
    }
  }, [isIdentificationComplete, isLocationComplete, isConditionsComplete, isCabinetComplete, isAccessibilityComplete, isSignageComplete]);

  const canAdvanceFromTab = useCallback((tab: number): boolean => {
    switch (tab) {
      case 0: return isIdentificationComplete;
      case 1: return isLocationComplete;
      case 2: return isConditionsComplete;
      case 3: return isCabinetComplete;
      case 4: return isAccessibilityComplete;
      case 5: return isSignageComplete;
      case 6: return true;
      default: return false;
    }
  }, [isIdentificationComplete, isLocationComplete, isConditionsComplete, isCabinetComplete, isAccessibilityComplete, isSignageComplete]);

  return {
    isIdentificationComplete,
    isLocationComplete,
    isConditionsComplete,
    isCabinetComplete,
    isAccessibilityComplete,
    isSignageComplete,
    isFormComplete,
    maxAllowedStep,
    canAdvanceFromTab,
  };
};
