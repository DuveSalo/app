// Database to domain type mappers
import type { Company, Employee, ConservationCertificate, SelfProtectionSystem, QRDocument, QRDocumentType, EventInformation } from '../../types';
import type { Tables } from '../supabase/database.types';
import { toCompanyServices, toPaymentMethods, toStringArray, toBooleanRecord } from '../utils/typeGuards';

/**
 * Maps database company row to domain Company type
 */
export const mapCompanyFromDb = (
  data: Tables<'companies'>,
  employees?: Tables<'employees'>[]
): Company => {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    cuit: data.cuit,
    address: data.address,
    postalCode: data.postal_code,
    city: data.city,
    locality: data.locality,
    province: data.province,
    country: data.country,
    ramaKey: data.rama_key || '',
    ownerEntity: data.owner_entity || '',
    phone: data.phone || '',
    isSubscribed: data.is_subscribed || false,
    selectedPlan: data.selected_plan || undefined,
    subscriptionStatus: data.subscription_status as 'active' | 'canceled' | 'expired' | undefined,
    subscriptionRenewalDate: data.subscription_renewal_date || undefined,
    services: toCompanyServices(data.services),
    paymentMethods: toPaymentMethods(data.payment_methods),
    employees: (employees || []).map(mapEmployeeFromDb),
  };
};

/**
 * Maps database employee row to domain Employee type
 */
export const mapEmployeeFromDb = (data: Tables<'employees'>): Employee => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
};

/**
 * Maps database certificate row to domain ConservationCertificate type
 */
export const mapCertificateFromDb = (data: Tables<'conservation_certificates'>): ConservationCertificate => {
  return {
    id: data.id,
    companyId: data.company_id,
    presentationDate: data.presentation_date,
    expirationDate: data.expiration_date,
    intervener: data.intervener,
    registrationNumber: data.registration_number,
    pdfFile: data.pdf_file_url || undefined,
    pdfFileName: data.pdf_file_name || undefined,
  };
};

/**
 * Maps database self protection system row to domain SelfProtectionSystem type
 */
export const mapSystemFromDb = (data: Tables<'self_protection_systems'>): SelfProtectionSystem => {
  return {
    id: data.id,
    companyId: data.company_id,
    probatoryDispositionDate: data.probatory_disposition_date || undefined,
    probatoryDispositionPdf: undefined, // Files are not stored in DB, only names/URLs
    probatoryDispositionPdfName: data.probatory_disposition_pdf_name || undefined,
    probatoryDispositionPdfUrl: data.probatory_disposition_pdf_url || undefined,
    extensionDate: data.extension_date,
    extensionPdf: undefined,
    extensionPdfName: data.extension_pdf_name || undefined,
    extensionPdfUrl: data.extension_pdf_url || undefined,
    expirationDate: data.expiration_date,
    drills: (data.drills || []) as any,
    intervener: data.intervener,
    registrationNumber: data.registration_number,
  };
};

/**
 * Maps database QR document row to domain QRDocument type
 */
export const mapQRDocumentFromDb = (data: Tables<'qr_documents'>): QRDocument => {
  return {
    id: data.id,
    companyId: data.company_id,
    type: data.type as QRDocumentType,
    documentName: data.document_name,
    floor: data.floor || undefined,
    unit: data.unit || undefined,
    pdfUrl: data.pdf_file_url || undefined,
    pdfFileName: data.document_name,
    uploadDate: data.upload_date,
    qrCodeData: data.qr_code_data || undefined,
    extractedDate: data.extracted_date,
  };
};

/**
 * Maps database event row to domain EventInformation type
 */
export const mapEventFromDb = (data: Tables<'events'>): EventInformation => {
  return {
    id: data.id,
    companyId: data.company_id,
    date: data.date,
    time: data.time,
    description: data.description,
    correctiveActions: data.corrective_actions,
    testimonials: toStringArray(data.testimonials),
    observations: toStringArray(data.observations),
    finalChecks: toBooleanRecord(data.final_checks),
  };
};
