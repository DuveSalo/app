
// Shared constants for company-related functionality
import { QRDocumentType } from '../../types';

/**
 * Service options for company services
 */
export const SERVICE_OPTIONS = [
  { value: QRDocumentType.Elevators, label: 'Ascensores' },
  { value: QRDocumentType.WaterHeaters, label: 'Calefones' },
  { value: QRDocumentType.FireSafetySystem, label: 'Sistema de Incendio' },
  { value: QRDocumentType.DetectionSystem, label: 'Sistema de Detección' },
  { value: QRDocumentType.ElectricalInstallations, label: 'Instalaciones Eléctricas' },
] as const;

/**
 * Maps from service label to QR document type
 */
export const SERVICE_LABEL_TO_VALUE_MAP = new Map(
  SERVICE_OPTIONS.map(opt => [opt.label, opt.value])
);

/**
 * Maps from QR document type to service label
 */
export const SERVICE_VALUE_TO_LABEL_MAP = new Map(
  SERVICE_OPTIONS.map(opt => [opt.value, opt.label])
);

