// Self-protection system related types

export interface Drill {
  date: string;
  pdfFile?: File;
  pdfFileName?: string;
}

export interface SelfProtectionSystem {
  id: string;
  companyId: string;
  probatoryDispositionDate?: string;
  probatoryDispositionPdf?: File;
  probatoryDispositionPdfName?: string;
  extensionDate: string;
  extensionPdf?: File;
  extensionPdfName?: string;
  expirationDate: string;
  drills: Drill[];
  intervener: string;
  registrationNumber: string;
}
