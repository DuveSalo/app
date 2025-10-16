// Self-protection system related types

export interface SelfProtectionSystem {
  id: string;
  companyId: string;
  systemName: string;
  systemType: string;
  location: string;
  installationDate?: string;
  lastInspectionDate: string;
  nextInspectionDate: string;
  inspectionFrequency: string;
  responsibleCompany: string;
  status: string;
  observations?: string;
}
