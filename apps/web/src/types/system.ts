// Self-protection system related types

export interface Drill {
  date: string;
  pdfFile?: File;
  pdfFileName?: string;
  pdfUrl?: string;
  pdfPath?: string;
}

export interface SelfProtectionSystem {
  id: string;
  companyId: string;
  probatoryDispositionDate?: string;
  probatoryDispositionPdf?: File;
  probatoryDispositionPdfName?: string;
  probatoryDispositionPdfUrl?: string;
  probatoryDispositionPdfPath?: string;
  extensionDate: string;
  extensionPdf?: File;
  extensionPdfName?: string;
  extensionPdfUrl?: string;
  extensionPdfPath?: string;
  expirationDate: string;
  drills: Drill[];
  intervener: string;
  registrationNumber: string;
}
