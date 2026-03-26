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
import type { AdminDocumentModule } from '../../../../features/admin/types';

/**
 * Inline mapper for fire extinguishers (same as in fireExtinguisher.ts).
 */
const mapFireExtinguisher = (item: any): FireExtinguisherControl => ({
  id: item.id,
  companyId: item.company_id,
  controlDate: item.control_date,
  extinguisherNumber: item.extinguisher_number,
  type: item.type,
  capacity: item.capacity,
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
  visibilityObstructed: item.visibility_obstructed,
  accessObstructed: item.access_obstructed,
  signageCondition: item.signage_condition,
  signageFloor: item.signage_floor,
  signageWall: item.signage_wall,
  signageHeight: item.signage_height,
  glassCondition: item.glass_condition,
  doorOpensEasily: item.door_opens_easily,
  cabinetClean: item.cabinet_clean,
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
    .select('*')
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
    .select('*')
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
    .select('*')
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
    .select('*')
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

export const getSchoolEvents = async (
  companyId: string
): Promise<EventInformation[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
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

export const adminDeleteFireExtinguisher = async (id: string): Promise<void> => {
  const { error } = await supabase.from('fire_extinguishers').delete().eq('id', id);
  if (error) handleSupabaseError(error);
  await logAdminAction('delete_document', 'fire_extinguisher', id);
};

export const adminDeleteCertificate = async (id: string): Promise<void> => {
  const { data } = await supabase
    .from('conservation_certificates')
    .select('pdf_file_path')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('conservation_certificates').delete().eq('id', id);
  if (error) handleSupabaseError(error);

  if (data?.pdf_file_path) {
    await supabase.storage.from('certificates').remove([data.pdf_file_path]);
  }
  await logAdminAction('delete_document', 'conservation_certificate', id);
};

export const adminDeleteSystem = async (id: string): Promise<void> => {
  const { data } = await supabase
    .from('self_protection_systems')
    .select('probatory_disposition_pdf_path, extension_pdf_path, drills')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('self_protection_systems').delete().eq('id', id);
  if (error) handleSupabaseError(error);

  if (data) {
    const filesToRemove: string[] = [];
    if (data.probatory_disposition_pdf_path)
      filesToRemove.push(data.probatory_disposition_pdf_path);
    if (data.extension_pdf_path)
      filesToRemove.push(data.extension_pdf_path);
    const drills = Array.isArray(data.drills) ? data.drills : [];
    for (const drill of drills) {
      if (typeof drill === 'object' && drill !== null && 'pdfPath' in drill && typeof (drill as Record<string, unknown>).pdfPath === 'string')
        filesToRemove.push((drill as Record<string, unknown>).pdfPath as string);
    }
    if (filesToRemove.length > 0) {
      await supabase.storage.from('self-protection-systems').remove(filesToRemove);
    }
  }
  await logAdminAction('delete_document', 'self_protection_system', id);
};

export const adminDeleteQRDocument = async (id: string): Promise<void> => {
  const { data } = await supabase
    .from('qr_documents')
    .select('pdf_file_path')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('qr_documents').delete().eq('id', id);
  if (error) handleSupabaseError(error);

  if (data?.pdf_file_path) {
    await supabase.storage.from('qr-documents').remove([data.pdf_file_path]);
  }
  await logAdminAction('delete_document', 'qr_document', id);
};

export const adminDeleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) handleSupabaseError(error);
  await logAdminAction('delete_document', 'event', id);
};

// ─── Signed URLs for PDF viewing ────────────────────────

export const getAdminSignedUrl = async (
  bucket: string,
  path: string
): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) handleSupabaseError(error);
  return data!.signedUrl;
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
  id: string
): Promise<void> => {
  switch (module) {
    case 'fire_extinguishers':
      return adminDeleteFireExtinguisher(id);
    case 'conservation_certificates':
      return adminDeleteCertificate(id);
    case 'self_protection_systems':
      return adminDeleteSystem(id);
    case 'qr_documents':
      return adminDeleteQRDocument(id);
    case 'events':
      return adminDeleteEvent(id);
  }
};
