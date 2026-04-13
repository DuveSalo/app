import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';
import {
  mapCertificateFromDb,
  mapSystemFromDb,
  mapQRDocumentFromDb,
  mapEventFromDb,
} from '../../mappers';
import type {
  FireExtinguisherControl,
  ConservationCertificate,
  SelfProtectionSystem,
  QRDocument,
  EventInformation,
} from '../../../../types';
import { ExtinguisherType, ExtinguisherCapacity, YesNo, YesNoNA } from '../../../../types';
import type { AdminDocumentModule } from '../../../../features/admin/types';
import type { Tables } from '../../../../types/database.types';

/**
 * Inline mapper for fire extinguishers (same as in fireExtinguisher.ts).
 */
const mapFireExtinguisher = (item: Tables<'fire_extinguishers'>): FireExtinguisherControl => ({
  id: item.id,
  companyId: item.company_id,
  controlDate: item.control_date,
  extinguisherNumber: item.extinguisher_number,
  type: item.type as ExtinguisherType,
  capacity: item.capacity as ExtinguisherCapacity,
  class: item.class,
  positionNumber: item.position_number,
  chargeExpirationDate: item.charge_expiration_date,
  hydraulicPressureExpirationDate: item.hydraulic_pressure_expiration_date,
  manufacturingYear: item.manufacturing_year,
  tagColor: item.tag_color,
  labelsLegible: item.labels_legible,
  pressureWithinRange: item.pressure_within_range,
  hasSealAndSafety: item.has_seal_and_safety,
  instructionsLegible: item.instructions_legible,
  containerCondition: item.container_condition,
  nozzleCondition: item.nozzle_condition,
  visibilityObstructed: item.visibility_obstructed as YesNo,
  accessObstructed: item.access_obstructed as YesNo,
  signageCondition: item.signage_condition,
  signageFloor: item.signage_floor as YesNoNA,
  signageWall: item.signage_wall as YesNoNA,
  signageHeight: item.signage_height as YesNoNA,
  glassCondition: item.glass_condition as YesNoNA,
  doorOpensEasily: item.door_opens_easily as YesNoNA,
  cabinetClean: item.cabinet_clean as YesNoNA,
  observations: item.observations,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

// ─── List documents ─────────────────────────────────────

export const getSchoolFireExtinguishers = async (
  companyId: string
): Promise<FireExtinguisherControl[]> => {
  const { data, error } = await supabase
    .from('fire_extinguishers')
    .select(
      'id, company_id, control_date, extinguisher_number, type, capacity, class, position_number, charge_expiration_date, hydraulic_pressure_expiration_date, manufacturing_year, tag_color, labels_legible, pressure_within_range, has_seal_and_safety, instructions_legible, container_condition, nozzle_condition, visibility_obstructed, access_obstructed, signage_condition, signage_floor, signage_wall, signage_height, glass_condition, door_opens_easily, cabinet_clean, observations, created_at, updated_at'
    )
    .eq('company_id', companyId)
    .order('control_date', { ascending: false });
  if (error) handleSupabaseError(error);
  return (data || []).map(mapFireExtinguisher);
};

export const getSchoolCertificates = async (
  companyId: string
): Promise<(ConservationCertificate & { pdfFilePath?: string })[]> => {
  const { data, error } = await supabase
    .from('conservation_certificates')
    .select(
      'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name, pdf_file_path, created_at, updated_at'
    )
    .eq('company_id', companyId)
    .order('expiration_date', { ascending: false });
  if (error) handleSupabaseError(error);
  return (data || []).map((row) => ({
    ...mapCertificateFromDb(row),
    pdfFilePath: row.pdf_file_path || undefined,
  }));
};

export const getSchoolSystems = async (
  companyId: string
): Promise<
  (SelfProtectionSystem & {
    probatoryDispositionPdfPath?: string;
    extensionPdfPath?: string;
    drillPdfPaths?: { date: string; path: string }[];
  })[]
> => {
  const { data, error } = await supabase
    .from('self_protection_systems')
    .select(
      'id, company_id, probatory_disposition_date, probatory_disposition_pdf_name, probatory_disposition_pdf_url, probatory_disposition_pdf_path, extension_date, extension_pdf_name, extension_pdf_url, extension_pdf_path, expiration_date, drills, intervener, registration_number, created_at, updated_at'
    )
    .eq('company_id', companyId)
    .order('expiration_date', { ascending: false });
  if (error) handleSupabaseError(error);
  return (data || []).map((row) => {
    const drills = (row.drills as { date?: string; pdfPath?: string }[] | null) || [];
    const drillPdfPaths = drills
      .filter((d) => d.pdfPath)
      .map((d) => ({ date: d.date || '', path: d.pdfPath! }));
    return {
      ...mapSystemFromDb(row),
      probatoryDispositionPdfPath: row.probatory_disposition_pdf_path || undefined,
      extensionPdfPath: row.extension_pdf_path || undefined,
      drillPdfPaths: drillPdfPaths.length > 0 ? drillPdfPaths : undefined,
    };
  });
};

export const getSchoolQRDocuments = async (
  companyId: string,
  type?: string
): Promise<(QRDocument & { pdfFilePath?: string })[]> => {
  let query = supabase
    .from('qr_documents')
    .select(
      'id, company_id, type, document_name, floor, unit, pdf_file_url, pdf_file_path, upload_date, qr_code_data, extracted_date, created_at, updated_at'
    )
    .eq('company_id', companyId)
    .order('upload_date', { ascending: false });
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) handleSupabaseError(error);
  return (data || []).map((row) => ({
    ...mapQRDocumentFromDb(row),
    pdfFilePath: row.pdf_file_path || undefined,
  }));
};

export const getSchoolEvents = async (companyId: string): Promise<EventInformation[]> => {
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, company_id, date, time, description, corrective_actions, testimonials, observations, final_checks, created_at, updated_at'
    )
    .eq('company_id', companyId)
    .order('date', { ascending: false });
  if (error) handleSupabaseError(error);
  return (data || []).map(mapEventFromDb);
};

// ─── Delete documents ───────────────────────────────────

const logAdminAction = async (
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, string | number | boolean | null>
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata: metadata || {},
  });
};

export const adminDeleteFireExtinguisher = async (id: string, companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('fire_extinguishers')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId);
  if (error) handleSupabaseError(error);
  await logAdminAction('delete_document', 'fire_extinguisher', id);
};

export const adminDeleteCertificate = async (id: string, companyId: string): Promise<void> => {
  const { data } = await supabase
    .from('conservation_certificates')
    .select('pdf_file_path')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  const { error } = await supabase
    .from('conservation_certificates')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId);
  if (error) handleSupabaseError(error);

  if (data?.pdf_file_path) {
    await supabase.storage.from('certificates').remove([data.pdf_file_path]);
  }
  await logAdminAction('delete_document', 'conservation_certificate', id);
};

export const adminDeleteSystem = async (id: string, companyId: string): Promise<void> => {
  const { data } = await supabase
    .from('self_protection_systems')
    .select('probatory_disposition_pdf_path, extension_pdf_path, drills')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  const { error } = await supabase
    .from('self_protection_systems')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId);
  if (error) handleSupabaseError(error);

  if (data) {
    const filesToRemove: string[] = [];
    if (data.probatory_disposition_pdf_path)
      filesToRemove.push(data.probatory_disposition_pdf_path);
    if (data.extension_pdf_path) filesToRemove.push(data.extension_pdf_path);
    const drills = Array.isArray(data.drills) ? data.drills : [];
    for (const drill of drills) {
      if (
        typeof drill === 'object' &&
        drill !== null &&
        'pdfPath' in drill &&
        typeof (drill as Record<string, unknown>).pdfPath === 'string'
      )
        filesToRemove.push((drill as Record<string, unknown>).pdfPath as string);
    }
    if (filesToRemove.length > 0) {
      await supabase.storage.from('self-protection-systems').remove(filesToRemove);
    }
  }
  await logAdminAction('delete_document', 'self_protection_system', id);
};

export const adminDeleteQRDocument = async (id: string, companyId: string): Promise<void> => {
  const { data } = await supabase
    .from('qr_documents')
    .select('pdf_file_path')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  const { error } = await supabase
    .from('qr_documents')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId);
  if (error) handleSupabaseError(error);

  if (data?.pdf_file_path) {
    await supabase.storage.from('qr-documents').remove([data.pdf_file_path]);
  }
  await logAdminAction('delete_document', 'qr_document', id);
};

export const adminDeleteEvent = async (id: string, companyId: string): Promise<void> => {
  const { error } = await supabase.from('events').delete().eq('id', id).eq('company_id', companyId);
  if (error) handleSupabaseError(error);
  await logAdminAction('delete_document', 'event', id);
};

// ─── Signed URLs for PDF viewing ────────────────────────

export const getAdminSignedUrl = async (bucket: string, path: string): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) handleSupabaseError(error);
  if (!data) throw new Error('No se pudo generar la URL firmada');
  return data.signedUrl;
};

// ─── Document fetcher by module key ─────────────────────

export const getSchoolDocuments = async (
  companyId: string,
  module: AdminDocumentModule
): Promise<unknown[]> => {
  switch (module) {
    case 'fire_extinguishers':
      return getSchoolFireExtinguishers(companyId);
    case 'conservation_certificates':
      return getSchoolCertificates(companyId);
    case 'self_protection_systems':
      return getSchoolSystems(companyId);
    case 'qr_documents':
      return getSchoolQRDocuments(companyId);
    case 'events':
      return getSchoolEvents(companyId);
  }
};

export const adminDeleteDocument = async (
  module: AdminDocumentModule,
  id: string,
  companyId: string
): Promise<void> => {
  switch (module) {
    case 'fire_extinguishers':
      return adminDeleteFireExtinguisher(id, companyId);
    case 'conservation_certificates':
      return adminDeleteCertificate(id, companyId);
    case 'self_protection_systems':
      return adminDeleteSystem(id, companyId);
    case 'qr_documents':
      return adminDeleteQRDocument(id, companyId);
    case 'events':
      return adminDeleteEvent(id, companyId);
  }
};
