// QR document related types

export enum QRDocumentType {
  Elevators = "Ascensores",
  WaterHeaters = "Termotanques y Caldera",
  FireSafetySystem = "Instalación Fija Contra Incendios",
  DetectionSystem = "Detección",
  ElectricalInstallations = "Medición de puesta a tierra",
}

export interface QRDocument {
  id: string;
  companyId: string;
  type: QRDocumentType;
  documentName: string;
  floor?: string;
  unit?: string;
  pdfUrl?: string;
  uploadDate: string;
  qrCodeData?: string;
}
