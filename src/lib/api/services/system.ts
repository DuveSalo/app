
import { supabase } from '../../supabase/client';
import { SelfProtectionSystem } from '../../../types/index';
import { mapSystemFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyIdByUserId } from './company';
import { createLogger } from '../../utils/logger';
import { TablesUpdate } from '../../../types/database.types';
import { PaginationParams, CursorPaginationParams, CursorPaginatedResult } from '../../../types/common';

const logger = createLogger('SystemService');

// Explicit column selection (avoid SELECT *)
const SYSTEM_COLUMNS = `
  id, company_id, probatory_disposition_date, probatory_disposition_pdf_name, probatory_disposition_pdf_url,
  extension_date, extension_pdf_name, extension_pdf_url, expiration_date, drills, intervener, registration_number
`.replace(/\s+/g, ' ').trim();

export const getSelfProtectionSystems = async (
  companyId?: string,
  pagination?: PaginationParams
): Promise<SelfProtectionSystem[]> => {
  let finalCompanyId = companyId;

  if (!finalCompanyId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new AuthError('Usuario no autenticado');
    }
    finalCompanyId = await getCompanyIdByUserId(currentUser.id);
  }

  let query = supabase
    .from('self_protection_systems')
    .select(SYSTEM_COLUMNS)
    .eq('company_id', finalCompanyId);

  if (pagination?.page && pagination?.pageSize) {
    const offset = (pagination.page - 1) * pagination.pageSize;
    query = query.range(offset, offset + pagination.pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error, 'Error al obtener sistemas de autoprotección');
  }

  return (data || []).map(mapSystemFromDb);
};

/**
 * Cursor-based pagination for self protection systems (O(1) performance on any page)
 */
export const getSelfProtectionSystemsCursor = async (
  companyId: string,
  params: CursorPaginationParams = {}
): Promise<CursorPaginatedResult<SelfProtectionSystem>> => {
  const limit = params.limit || 20;
  const fetchLimit = limit + 1;

  let query = supabase
    .from('self_protection_systems')
    .select(SYSTEM_COLUMNS)
    .eq('company_id', companyId)
    .order('expiration_date', { ascending: false })
    .order('id', { ascending: false })
    .limit(fetchLimit);

  if (params.cursor) {
    try {
      const decoded = atob(params.cursor);
      const [cursorDate, cursorId] = decoded.split('|');
      if (cursorDate && cursorId) {
        query = query.or(`expiration_date.lt.${cursorDate},and(expiration_date.eq.${cursorDate},id.lt.${cursorId})`);
      }
    } catch { /* Invalid cursor */ }
  }

  const { data, error } = await query;
  if (error) handleSupabaseError(error);

  const items = (data || []).slice(0, limit).map(mapSystemFromDb);
  const hasMore = (data || []).length > limit;
  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  return {
    items,
    nextCursor: hasMore && lastItem ? btoa(`${lastItem.expirationDate}|${lastItem.id}`) : null,
    prevCursor: params.cursor && firstItem ? btoa(`${firstItem.expirationDate}|${firstItem.id}`) : null,
    hasMore,
  };
};

export const getSelfProtectionSystemById = async (id: string): Promise<SelfProtectionSystem> => {
  const { data, error } = await supabase
    .from('self_protection_systems')
    .select(SYSTEM_COLUMNS)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new NotFoundError('Sistema de autoprotección no encontrado', 'system');
  }

  return mapSystemFromDb(data);
};

export const createSelfProtectionSystem = async (systemData: Omit<SelfProtectionSystem, 'id' | 'companyId'>): Promise<SelfProtectionSystem> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  // Use lightweight helper - only get company_id (N+1 optimization)
  const companyId = await getCompanyIdByUserId(currentUser.id);

  // Upload all PDF files in parallel
  const uploadProbatory = async (): Promise<string | null> => {
    if (!(systemData.probatoryDispositionPdf instanceof File)) return null;
    const originalName = systemData.probatoryDispositionPdfName || systemData.probatoryDispositionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/probatory/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('self-protection-systems')
      .upload(fileName, systemData.probatoryDispositionPdf, {
        contentType: systemData.probatoryDispositionPdf.type || 'application/pdf',
        upsert: false
      });
    if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF de disposición probatoria');
    if (!uploadData) return null;
    const { data: urlData } = supabase.storage.from('self-protection-systems').getPublicUrl(uploadData.path);
    return urlData.publicUrl;
  };

  const uploadExtension = async (): Promise<string | null> => {
    if (!(systemData.extensionPdf instanceof File)) return null;
    const originalName = systemData.extensionPdfName || systemData.extensionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/extension/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('self-protection-systems')
      .upload(fileName, systemData.extensionPdf, {
        contentType: systemData.extensionPdf.type || 'application/pdf',
        upsert: false
      });
    if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF de extensión');
    if (!uploadData) return null;
    const { data: urlData } = supabase.storage.from('self-protection-systems').getPublicUrl(uploadData.path);
    return urlData.publicUrl;
  };

  const uploadDrills = (systemData.drills || []).map(async (drill, index) => {
    let drillPdfUrl: string | null = null;
    if (drill.pdfFile instanceof File) {
      const originalName = drill.pdfFileName || drill.pdfFile.name;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${companyId}/drills/${Date.now()}_${index}_${sanitizedName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('self-protection-systems')
        .upload(fileName, drill.pdfFile, {
          contentType: drill.pdfFile.type || 'application/pdf',
          upsert: false
        });
      if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF del simulacro');
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('self-protection-systems').getPublicUrl(uploadData.path);
        drillPdfUrl = urlData.publicUrl;
      }
    }
    return { date: drill.date, pdfFileName: drill.pdfFileName || null, pdfUrl: drillPdfUrl };
  });

  const [probatoryPdfUrl, extensionPdfUrl, ...drillsWithUrls] = await Promise.all([
    uploadProbatory(),
    uploadExtension(),
    ...uploadDrills,
  ]);

  // Insert the record directly
  const { data, error } = await supabase
    .from('self_protection_systems')
    .insert({
      company_id: companyId,
      probatory_disposition_date: systemData.probatoryDispositionDate || null,
      probatory_disposition_pdf_name: systemData.probatoryDispositionPdfName || null,
      probatory_disposition_pdf_url: probatoryPdfUrl,
      extension_date: systemData.extensionDate,
      extension_pdf_name: systemData.extensionPdfName || null,
      extension_pdf_url: extensionPdfUrl,
      expiration_date: systemData.expirationDate,
      drills: drillsWithUrls,
      intervener: systemData.intervener,
      registration_number: systemData.registrationNumber,
    })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapSystemFromDb(data);
};

export const updateSelfProtectionSystem = async (systemData: SelfProtectionSystem): Promise<SelfProtectionSystem> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  // Use lightweight helper - only get company_id (N+1 optimization)
  const companyId = await getCompanyIdByUserId(currentUser.id);

  // Upload all PDF files in parallel
  const uploadProbatory = async (): Promise<string | null> => {
    if (!(systemData.probatoryDispositionPdf instanceof File)) return null;
    const originalName = systemData.probatoryDispositionPdfName || systemData.probatoryDispositionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/probatory/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('self-protection-systems')
      .upload(fileName, systemData.probatoryDispositionPdf, {
        contentType: systemData.probatoryDispositionPdf.type || 'application/pdf',
        upsert: false
      });
    if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF de disposición probatoria');
    if (!uploadData) return null;
    const { data: urlData } = supabase.storage.from('self-protection-systems').getPublicUrl(uploadData.path);
    return urlData.publicUrl;
  };

  const uploadExtension = async (): Promise<string | null> => {
    if (!(systemData.extensionPdf instanceof File)) return null;
    const originalName = systemData.extensionPdfName || systemData.extensionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/extension/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('self-protection-systems')
      .upload(fileName, systemData.extensionPdf, {
        contentType: systemData.extensionPdf.type || 'application/pdf',
        upsert: false
      });
    if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF de extensión');
    if (!uploadData) return null;
    const { data: urlData } = supabase.storage.from('self-protection-systems').getPublicUrl(uploadData.path);
    return urlData.publicUrl;
  };

  const uploadDrills = (systemData.drills || []).map(async (drill, index) => {
    let drillPdfUrl: string | null = drill.pdfUrl || null;
    if (drill.pdfFile instanceof File) {
      const originalName = drill.pdfFileName || drill.pdfFile.name;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${companyId}/drills/${Date.now()}_${index}_${sanitizedName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('self-protection-systems')
        .upload(fileName, drill.pdfFile, {
          contentType: drill.pdfFile.type || 'application/pdf',
          upsert: false
        });
      if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF del simulacro');
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('self-protection-systems').getPublicUrl(uploadData.path);
        drillPdfUrl = urlData.publicUrl;
      }
    }
    return { date: drill.date, pdfFileName: drill.pdfFileName || null, pdfUrl: drillPdfUrl };
  });

  const [probatoryPdfUrl, extensionPdfUrl, ...drillsWithUrls] = await Promise.all([
    uploadProbatory(),
    uploadExtension(),
    ...uploadDrills,
  ]);

  // Prepare update data
  const updateData: TablesUpdate<'self_protection_systems'> = {
    probatory_disposition_date: systemData.probatoryDispositionDate || null,
    extension_date: systemData.extensionDate,
    expiration_date: systemData.expirationDate,
    drills: drillsWithUrls,
    intervener: systemData.intervener,
    registration_number: systemData.registrationNumber,
  };

  // Only update PDF fields if new files were uploaded
  if (probatoryPdfUrl) {
    updateData.probatory_disposition_pdf_url = probatoryPdfUrl;
    updateData.probatory_disposition_pdf_name = systemData.probatoryDispositionPdfName;
  }

  if (extensionPdfUrl) {
    updateData.extension_pdf_url = extensionPdfUrl;
    updateData.extension_pdf_name = systemData.extensionPdfName;
  }

  logger.debug('Updating self protection system', {
    systemId: systemData.id,
    hasExtensionPdf: !!extensionPdfUrl
  });

  const { data, error } = await supabase
    .from('self_protection_systems')
    .update(updateData)
    .eq('id', systemData.id)
    .select()
    .single();

  if (data) {
    logger.debug('Self protection system updated successfully', { systemId: data.id });
  }

  if (error) {
    handleSupabaseError(error);
  }

  return mapSystemFromDb(data);
};

export const deleteSelfProtectionSystem = async (id: string): Promise<void> => {
  // Fetch file paths before deleting the record
  const { data: sys } = await supabase
    .from('self_protection_systems')
    .select('probatory_disposition_pdf_path, extension_pdf_path, drills')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('self_protection_systems')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }

  // Clean up storage (best-effort)
  const filesToRemove: string[] = [];
  if (sys?.probatory_disposition_pdf_path) filesToRemove.push(sys.probatory_disposition_pdf_path);
  if (sys?.extension_pdf_path) filesToRemove.push(sys.extension_pdf_path);
  if (Array.isArray(sys?.drills)) {
    for (const drill of sys.drills as Array<{ pdfPath?: string }>) {
      if (drill.pdfPath) filesToRemove.push(drill.pdfPath);
    }
  }
  if (filesToRemove.length > 0) {
    await supabase.storage.from('self-protection-systems').remove(filesToRemove).catch(() => {});
  }
};
