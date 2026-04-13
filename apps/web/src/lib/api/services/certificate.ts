import { supabase } from '../../supabase/client';
import { ConservationCertificate } from '../../../types/index';
import { mapCertificateFromDb } from '../mappers';
import { NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getAuthenticatedCompanyId } from './context';
import { TablesUpdate } from '../../../types/database.types';
import {
  PaginationParams,
  CursorPaginationParams,
  CursorPaginatedResult,
} from '../../../types/common';
import { parseCursor } from '../../utils/pagination';

const isNotFoundError = (error: { code?: string; message: string }): boolean =>
  error.code === 'PGRST116' || error.message.toLowerCase() === 'not found';

export const getCertificates = async (
  companyId?: string,
  pagination?: PaginationParams
): Promise<ConservationCertificate[]> => {
  let finalCompanyId = companyId;

  if (!finalCompanyId) {
    finalCompanyId = await getAuthenticatedCompanyId();
  }

  const columns =
    'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name, pdf_file_path, created_at, updated_at';

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
  const columns =
    'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name, pdf_file_path, created_at, updated_at';
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

  const items = (data || []).slice(0, limit).map(mapCertificateFromDb);
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

export const getCertificateById = async (id: string): Promise<ConservationCertificate> => {
  const companyId = await getAuthenticatedCompanyId();

  const columns =
    'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name, pdf_file_path, created_at, updated_at';

  const { data, error } = await supabase
    .from('conservation_certificates')
    .select(columns)
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (error) {
    if (isNotFoundError(error)) {
      throw new NotFoundError('Certificado no encontrado', 'certificate');
    }
    handleSupabaseError(error, 'Error al obtener certificado');
  }
  if (!data) {
    throw new NotFoundError('Certificado no encontrado', 'certificate');
  }

  return mapCertificateFromDb(data);
};

export const createCertificate = async (
  certData: Omit<ConservationCertificate, 'id' | 'companyId'>
): Promise<ConservationCertificate> => {
  const companyId = await getAuthenticatedCompanyId();

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
        upsert: false,
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el archivo PDF');
    }

    if (uploadData) {
      pdfFilePath = uploadData.path;

      // Get signed URL (private bucket)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('certificates')
        .createSignedUrl(uploadData.path, 3600);
      if (urlError) throw urlError;

      pdfFileUrl = urlData.signedUrl;
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
    .select(
      'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name, pdf_file_path, created_at, updated_at'
    )
    .single();

  if (error) {
    handleSupabaseError(error);
  }
  if (!data) throw new Error('No se pudo crear el certificado');

  return mapCertificateFromDb(data);
};

export const updateCertificate = async (
  certData: ConservationCertificate
): Promise<ConservationCertificate> => {
  const companyId = await getAuthenticatedCompanyId();

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload new file to Supabase Storage if provided
  if (certData.pdfFile && certData.pdfFile instanceof File) {
    // Delete old file before uploading the new one (best-effort)
    const { data: existing } = await supabase
      .from('conservation_certificates')
      .select('pdf_file_path')
      .eq('id', certData.id)
      .eq('company_id', companyId)
      .single();

    if (existing?.pdf_file_path) {
      await supabase.storage
        .from('certificates')
        .remove([existing.pdf_file_path])
        .catch(() => {});
    }

    // Sanitize filename - remove special characters and spaces
    const originalName = certData.pdfFileName || certData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${companyId}/${Date.now()}_${sanitizedName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, certData.pdfFile, {
        contentType: certData.pdfFile.type || 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el archivo PDF');
    }

    if (uploadData) {
      pdfFilePath = uploadData.path;

      // Get signed URL (private bucket)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('certificates')
        .createSignedUrl(uploadData.path, 3600);
      if (urlError) throw urlError;

      pdfFileUrl = urlData.signedUrl;
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
    .eq('company_id', companyId)
    .select(
      'id, company_id, presentation_date, expiration_date, intervener, registration_number, pdf_file_url, pdf_file_name, pdf_file_path, created_at, updated_at'
    )
    .single();

  if (error) {
    handleSupabaseError(error);
  }
  if (!data) throw new Error('No se pudo actualizar el certificado');

  return mapCertificateFromDb(data);
};

export const deleteCertificate = async (id: string): Promise<void> => {
  const companyId = await getAuthenticatedCompanyId();

  // Fetch file path before deleting the record
  const { data: cert } = await supabase
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

  if (error) {
    handleSupabaseError(error);
  }

  // Clean up storage (best-effort, don't fail the delete if this errors)
  if (cert?.pdf_file_path) {
    await supabase.storage
      .from('certificates')
      .remove([cert.pdf_file_path])
      .catch(() => {});
  }
};
