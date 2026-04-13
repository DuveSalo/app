import { supabase } from '../../../supabase/client';
import { SelfProtectionSystem } from '../../../../types/index';
import { mapSystemFromDb } from '../../mappers';
import { NotFoundError, handleSupabaseError } from '../../../utils/errors';
import { getAuthenticatedCompanyId } from '../context';
import { createLogger } from '../../../utils/logger';
import { TablesUpdate } from '../../../../types/database.types';
import {
  PaginationParams,
  CursorPaginationParams,
  CursorPaginatedResult,
} from '../../../../types/common';
import { parseCursor } from '../../../utils/pagination';
import { SYSTEM_STORAGE_BUCKET, createSystemDocumentSignedUrl } from './documents';

const logger = createLogger('SystemService');

const SYSTEM_COLUMNS =
  'id, company_id, probatory_disposition_date, probatory_disposition_pdf_name, probatory_disposition_pdf_url, probatory_disposition_pdf_path, extension_date, extension_pdf_name, extension_pdf_url, extension_pdf_path, expiration_date, drills, intervener, registration_number, created_at, updated_at';

export const getSelfProtectionSystems = async (
  companyId?: string,
  pagination?: PaginationParams
): Promise<SelfProtectionSystem[]> => {
  let finalCompanyId = companyId;

  if (!finalCompanyId) {
    finalCompanyId = await getAuthenticatedCompanyId();
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
      const { cursorDate, cursorId } = parseCursor(params.cursor);
      query = query.or(
        `expiration_date.lt.${cursorDate},and(expiration_date.eq.${cursorDate},id.lt.${cursorId})`
      );
    } catch {
      /* Invalid cursor */
    }
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
    prevCursor:
      params.cursor && firstItem ? btoa(`${firstItem.expirationDate}|${firstItem.id}`) : null,
    hasMore,
  };
};

export const getSelfProtectionSystemById = async (id: string): Promise<SelfProtectionSystem> => {
  const companyId = await getAuthenticatedCompanyId();

  const { data, error } = await supabase
    .from('self_protection_systems')
    .select(SYSTEM_COLUMNS)
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Sistema de autoprotección no encontrado', 'system');
    }
    handleSupabaseError(error, 'Error al obtener sistema de autoprotección');
  }
  if (!data) {
    throw new NotFoundError('Sistema de autoprotección no encontrado', 'system');
  }

  return mapSystemFromDb(data);
};

export const createSelfProtectionSystem = async (
  systemData: Omit<SelfProtectionSystem, 'id' | 'companyId'>
): Promise<SelfProtectionSystem> => {
  const companyId = await getAuthenticatedCompanyId();

  // Upload all PDF files in parallel — return both path and signed URL
  const uploadProbatory = async (): Promise<{ path: string; url: string } | null> => {
    if (!(systemData.probatoryDispositionPdf instanceof File)) return null;
    const originalName =
      systemData.probatoryDispositionPdfName || systemData.probatoryDispositionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/probatory/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SYSTEM_STORAGE_BUCKET)
      .upload(fileName, systemData.probatoryDispositionPdf, {
        contentType: systemData.probatoryDispositionPdf.type || 'application/pdf',
        upsert: false,
      });
    if (uploadError)
      handleSupabaseError(uploadError, 'Error al subir el PDF de disposición probatoria');
    if (!uploadData) return null;
    const url = await createSystemDocumentSignedUrl(uploadData.path);
    return { path: uploadData.path, url };
  };

  const uploadExtension = async (): Promise<{ path: string; url: string } | null> => {
    if (!(systemData.extensionPdf instanceof File)) return null;
    const originalName = systemData.extensionPdfName || systemData.extensionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/extension/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SYSTEM_STORAGE_BUCKET)
      .upload(fileName, systemData.extensionPdf, {
        contentType: systemData.extensionPdf.type || 'application/pdf',
        upsert: false,
      });
    if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF de extensión');
    if (!uploadData) return null;
    const url = await createSystemDocumentSignedUrl(uploadData.path);
    return { path: uploadData.path, url };
  };

  const uploadDrills = (systemData.drills || []).map(async (drill, index) => {
    let drillPdfUrl: string | null = null;
    let drillPdfPath: string | null = null;
    if (drill.pdfFile instanceof File) {
      const originalName = drill.pdfFileName || drill.pdfFile.name;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${companyId}/drills/${Date.now()}_${index}_${sanitizedName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(SYSTEM_STORAGE_BUCKET)
        .upload(fileName, drill.pdfFile, {
          contentType: drill.pdfFile.type || 'application/pdf',
          upsert: false,
        });
      if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF del simulacro');
      if (uploadData) {
        drillPdfPath = uploadData.path;
        drillPdfUrl = await createSystemDocumentSignedUrl(uploadData.path);
      }
    }
    return {
      date: drill.date,
      pdfFileName: drill.pdfFileName || null,
      pdfUrl: drillPdfUrl,
      pdfPath: drillPdfPath,
    };
  });

  const [probatoryResult, extensionResult, ...drillsWithUrls] = await Promise.all([
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
      probatory_disposition_pdf_url: probatoryResult?.url || null,
      probatory_disposition_pdf_path: probatoryResult?.path || null,
      extension_date: systemData.extensionDate,
      extension_pdf_name: systemData.extensionPdfName || null,
      extension_pdf_url: extensionResult?.url || null,
      extension_pdf_path: extensionResult?.path || null,
      expiration_date: systemData.expirationDate,
      drills: drillsWithUrls,
      intervener: systemData.intervener,
      registration_number: systemData.registrationNumber,
    })
    .select(SYSTEM_COLUMNS)
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapSystemFromDb(data!);
};

export const updateSelfProtectionSystem = async (
  systemData: SelfProtectionSystem
): Promise<SelfProtectionSystem> => {
  const companyId = await getAuthenticatedCompanyId();

  // Upload all PDF files in parallel — return both path and signed URL
  const uploadProbatory = async (): Promise<{ path: string; url: string } | null> => {
    if (!(systemData.probatoryDispositionPdf instanceof File)) return null;
    const originalName =
      systemData.probatoryDispositionPdfName || systemData.probatoryDispositionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/probatory/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SYSTEM_STORAGE_BUCKET)
      .upload(fileName, systemData.probatoryDispositionPdf, {
        contentType: systemData.probatoryDispositionPdf.type || 'application/pdf',
        upsert: false,
      });
    if (uploadError)
      handleSupabaseError(uploadError, 'Error al subir el PDF de disposición probatoria');
    if (!uploadData) return null;
    const url = await createSystemDocumentSignedUrl(uploadData.path);
    return { path: uploadData.path, url };
  };

  const uploadExtension = async (): Promise<{ path: string; url: string } | null> => {
    if (!(systemData.extensionPdf instanceof File)) return null;
    const originalName = systemData.extensionPdfName || systemData.extensionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/extension/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SYSTEM_STORAGE_BUCKET)
      .upload(fileName, systemData.extensionPdf, {
        contentType: systemData.extensionPdf.type || 'application/pdf',
        upsert: false,
      });
    if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF de extensión');
    if (!uploadData) return null;
    const url = await createSystemDocumentSignedUrl(uploadData.path);
    return { path: uploadData.path, url };
  };

  const uploadDrills = (systemData.drills || []).map(async (drill, index) => {
    let drillPdfUrl: string | null = drill.pdfUrl || null;
    let drillPdfPath: string | null = drill.pdfPath || null;
    if (drill.pdfFile instanceof File) {
      const originalName = drill.pdfFileName || drill.pdfFile.name;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${companyId}/drills/${Date.now()}_${index}_${sanitizedName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(SYSTEM_STORAGE_BUCKET)
        .upload(fileName, drill.pdfFile, {
          contentType: drill.pdfFile.type || 'application/pdf',
          upsert: false,
        });
      if (uploadError) handleSupabaseError(uploadError, 'Error al subir el PDF del simulacro');
      if (uploadData) {
        drillPdfPath = uploadData.path;
        drillPdfUrl = await createSystemDocumentSignedUrl(uploadData.path);
      }
    }
    return {
      date: drill.date,
      pdfFileName: drill.pdfFileName || null,
      pdfUrl: drillPdfUrl,
      pdfPath: drillPdfPath,
    };
  });

  const [probatoryResult, extensionResult, ...drillsWithUrls] = await Promise.all([
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
  if (probatoryResult) {
    updateData.probatory_disposition_pdf_url = probatoryResult.url;
    updateData.probatory_disposition_pdf_path = probatoryResult.path;
    updateData.probatory_disposition_pdf_name = systemData.probatoryDispositionPdfName;
  }

  if (extensionResult) {
    updateData.extension_pdf_url = extensionResult.url;
    updateData.extension_pdf_path = extensionResult.path;
    updateData.extension_pdf_name = systemData.extensionPdfName;
  }

  logger.debug('Updating self protection system', {
    systemId: systemData.id,
    hasExtensionPdf: !!extensionResult?.url,
  });

  const { data, error } = await supabase
    .from('self_protection_systems')
    .update(updateData)
    .eq('id', systemData.id)
    .eq('company_id', companyId)
    .select(SYSTEM_COLUMNS)
    .single();

  if (data) {
    logger.debug('Self protection system updated successfully', { systemId: data.id });
  }

  if (error) {
    handleSupabaseError(error);
  }

  return mapSystemFromDb(data!);
};

export const deleteSelfProtectionSystem = async (id: string): Promise<void> => {
  // Fetch file paths before deleting the record
  const { data: sys } = await supabase
    .from('self_protection_systems')
    .select('probatory_disposition_pdf_path, extension_pdf_path, drills')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('self_protection_systems').delete().eq('id', id);

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
    await supabase.storage
      .from(SYSTEM_STORAGE_BUCKET)
      .remove(filesToRemove)
      .catch(() => {});
  }
};
