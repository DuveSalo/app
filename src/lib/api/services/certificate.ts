
import { supabase } from '../../supabase/client';
import { ConservationCertificate } from '../../../types/index';
import { mapCertificateFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyIdByUserId } from './company';
import { TablesUpdate } from '../../../types/database.types';
import { PaginationParams, CursorPaginationParams, CursorPaginatedResult } from '../../../types/common';

export const getCertificates = async (
  companyId?: string,
  pagination?: PaginationParams
): Promise<ConservationCertificate[]> => {
  let finalCompanyId = companyId;

  if (!finalCompanyId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new AuthError('Usuario no autenticado');
    }
    finalCompanyId = await getCompanyIdByUserId(currentUser.id);
  }

  // Explicit column selection (avoid SELECT *)
  const columns = 'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name';

  let query = supabase
    .from('conservation_certificates')
    .select(columns)
    .eq('company_id', finalCompanyId);

  if (pagination?.page && pagination?.pageSize) {
    const offset = (pagination.page - 1) * pagination.pageSize;
    query = query.range(offset, offset + pagination.pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error, 'Error al obtener certificados');
  }

  return (data || []).map(mapCertificateFromDb);
};

/**
 * Cursor-based pagination for certificates (O(1) performance on any page)
 */
export const getCertificatesCursor = async (
  companyId: string,
  params: CursorPaginationParams = {}
): Promise<CursorPaginatedResult<ConservationCertificate>> => {
  const columns = 'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name';
  const limit = params.limit || 20;
  const fetchLimit = limit + 1;

  let query = supabase
    .from('conservation_certificates')
    .select(columns)
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

  const items = (data || []).slice(0, limit).map(mapCertificateFromDb);
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

export const getCertificateById = async (id: string): Promise<ConservationCertificate> => {
  // Explicit column selection (avoid SELECT *)
  const columns = 'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name';

  const { data, error } = await supabase
    .from('conservation_certificates')
    .select(columns)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new NotFoundError('Certificado no encontrado', 'certificate');
  }

  return mapCertificateFromDb(data);
};

export const createCertificate = async (certData: Omit<ConservationCertificate, 'id' | 'companyId'>): Promise<ConservationCertificate> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  // Use lightweight helper - only get company_id (N+1 optimization)
  const companyId = await getCompanyIdByUserId(currentUser.id);

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload file to Supabase Storage if provided
  if (certData.pdfFile && certData.pdfFile instanceof File) {
    // Sanitize filename - remove special characters and spaces
    const originalName = certData.pdfFileName || certData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/${Date.now()}_${sanitizedName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, certData.pdfFile, {
        contentType: certData.pdfFile.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el archivo PDF');
    }

    if (uploadData) {
      pdfFilePath = uploadData.path;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(uploadData.path);

      pdfFileUrl = urlData.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from('conservation_certificates')
    .insert({
      company_id: companyId,
      presentation_date: certData.presentationDate,
      expiration_date: certData.expirationDate,
      intervener: certData.intervener,
      registration_number: certData.registrationNumber,
      pdf_file_url: pdfFileUrl,
      pdf_file_path: pdfFilePath,
      pdf_file_name: certData.pdfFileName || null,
    })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapCertificateFromDb(data);
};

export const updateCertificate = async (certData: ConservationCertificate): Promise<ConservationCertificate> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  // Use lightweight helper - only get company_id (N+1 optimization)
  const companyId = await getCompanyIdByUserId(currentUser.id);

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload new file to Supabase Storage if provided
  if (certData.pdfFile && certData.pdfFile instanceof File) {
    // Sanitize filename - remove special characters and spaces
    const originalName = certData.pdfFileName || certData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/${Date.now()}_${sanitizedName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, certData.pdfFile, {
        contentType: certData.pdfFile.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el archivo PDF');
    }

    if (uploadData) {
      pdfFilePath = uploadData.path;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(uploadData.path);

      pdfFileUrl = urlData.publicUrl;
    }
  }

  const updateData: TablesUpdate<'conservation_certificates'> = {
    presentation_date: certData.presentationDate,
    expiration_date: certData.expirationDate,
    intervener: certData.intervener,
    registration_number: certData.registrationNumber,
    pdf_file_name: certData.pdfFileName || null,
  };

  // Only update PDF fields if a new file was uploaded
  if (pdfFileUrl) {
    updateData.pdf_file_url = pdfFileUrl;
    updateData.pdf_file_path = pdfFilePath;
  }

  const { data, error } = await supabase
    .from('conservation_certificates')
    .update(updateData)
    .eq('id', certData.id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapCertificateFromDb(data);
};

export const deleteCertificate = async (id: string): Promise<void> => {
  // Fetch file path before deleting the record
  const { data: cert } = await supabase
    .from('conservation_certificates')
    .select('pdf_file_path')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('conservation_certificates')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }

  // Clean up storage (best-effort, don't fail the delete if this errors)
  if (cert?.pdf_file_path) {
    await supabase.storage.from('certificates').remove([cert.pdf_file_path]).catch(() => {});
  }
};
