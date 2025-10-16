// Conservation certificate related types

export interface ConservationCertificate {
  id: string;
  companyId: string;
  presentationDate: string;
  expirationDate: string;
  intervener: string;
  registrationNumber: string;
  pdfFile?: File | string;
  pdfFileName?: string;
}
