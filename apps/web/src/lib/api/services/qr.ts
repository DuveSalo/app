
import { supabase } from '../../supabase/client';
import { QRDocument, QRDocumentType, QRDocumentCreate } from '../../../types/index';
import { mapQRDocumentFromDb } from '../mappers';
import { NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getAuthenticatedCompanyId } from './context';
import { TablesUpdate } from '../../../types/database.types';
import { PaginationParams, CursorPaginationParams, CursorPaginatedResult } from '../../../types/common';
import { parseCursor } from '../../utils/pagination';

const QR_DOCUMENT_COLUMNS = '*';

export const getQRDocuments = async (type: QRDocumentType, companyId?: string): Promise<QRDocument[]> => {
  // Server-side filtering (N+1 fix - no longer fetches ALL documents then filters client-side)
  let finalCompanyId = companyId;

  if (!finalCompanyId) {
    finalCompanyId = await getAuthenticatedCompanyId();
  }

  const { data, error } = await supabase
    .from('qr_documents')
    .select(QR_DOCUMENT_COLUMNS)
    .eq('company_id', finalCompanyId)
    .eq('type', type);

  if (error) {
    handleSupabaseError(error, 'Error al obtener documentos QR');
  }

  return (data || []).map(mapQRDocumentFromDb);
};

export const getAllQRDocuments = async (
  companyId?: string,
  pagination?: PaginationParams
): Promise<QRDocument[]> => {
  let finalCompanyId = companyId;

  if (!finalCompanyId) {
    finalCompanyId = await getAuthenticatedCompanyId();
  }

  let query = supabase
    .from('qr_documents')
    .select(QR_DOCUMENT_COLUMNS)
    .eq('company_id', finalCompanyId);

  if (pagination?.page && pagination?.pageSize) {
    const offset = (pagination.page - 1) * pagination.pageSize;
    query = query.range(offset, offset + pagination.pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error, 'Error al obtener documentos QR');
  }

  return (data || []).map(mapQRDocumentFromDb);
};

/**
 * Cursor-based pagination for QR documents (O(1) performance on any page)
 */
export const getQRDocumentsCursor = async (
  companyId: string,
  type?: QRDocumentType,
  params: CursorPaginationParams = {}
): Promise<CursorPaginatedResult<QRDocument>> => {
  const limit = params.limit || 20;
  const fetchLimit = limit + 1;

  let query = supabase
    .from('qr_documents')
    .select(QR_DOCUMENT_COLUMNS)
    .eq('company_id', companyId)
    .order('upload_date', { ascending: false })
    .order('id', { ascending: false })
    .limit(fetchLimit);

  if (type) {
    query = query.eq('type', type);
  }

  if (params.cursor) {
    try {
      const { cursorDate, cursorId } = parseCursor(params.cursor);
      query = query.or(`upload_date.lt.${cursorDate},and(upload_date.eq.${cursorDate},id.lt.${cursorId})`);
    } catch { /* Invalid cursor */ }
  }

  const { data, error } = await query;
  if (error) handleSupabaseError(error);

  const items = (data || []).slice(0, limit).map(mapQRDocumentFromDb);
  const hasMore = (data || []).length > limit;
  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  return {
    items,
    nextCursor: hasMore && lastItem ? btoa(`${lastItem.uploadDate}|${lastItem.id}`) : null,
    prevCursor: params.cursor && firstItem ? btoa(`${firstItem.uploadDate}|${firstItem.id}`) : null,
    hasMore,
  };
};

export const uploadQRDocument = async (docData: QRDocumentCreate): Promise<QRDocument> => {
  const companyId = await getAuthenticatedCompanyId();

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload file to Supabase Storage if provided
  if (docData.pdfFile && docData.pdfFile instanceof File) {
    // Sanitize filename - remove special characters and spaces
    const originalName = docData.pdfFileName || docData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Organize files by company, then by document type
    const fileName = `${companyId}/${docData.type}/${Date.now()}_${sanitizedName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('qr-documents')
      .upload(fileName, docData.pdfFile, {
        contentType: docData.pdfFile.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el archivo PDF');
    }

    if (uploadData) {
      pdfFilePath = uploadData.path;

      // Get signed URL (private bucket)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('qr-documents')
        .createSignedUrl(uploadData.path, 3600);
      if (urlError) throw urlError;

      pdfFileUrl = urlData.signedUrl;
    }
  }

  const { data, error } = await supabase
    .from('qr_documents')
    .insert({
      company_id: companyId,
      type: docData.type,
      document_name: docData.documentName,
      floor: docData.floor || null,
      unit: docData.unit || null,
      pdf_file_url: pdfFileUrl,
      pdf_file_path: pdfFilePath,
      qr_code_data: docData.qrCodeData || null,
      upload_date: new Date().toISOString().split('T')[0],
      extracted_date: docData.extractedDate,
    })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapQRDocumentFromDb(data!);
};

export const getQRDocumentById = async (id: string): Promise<QRDocument> => {
  const companyId = await getAuthenticatedCompanyId();

  const { data, error } = await supabase
    .from('qr_documents')
    .select(QR_DOCUMENT_COLUMNS)
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Documento QR no encontrado', 'qr_document');
  }

  return mapQRDocumentFromDb(data);
};

export const updateQRDocument = async (id: string, docData: Partial<QRDocumentCreate>): Promise<QRDocument> => {
  const companyId = await getAuthenticatedCompanyId();

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload new file to Supabase Storage if provided
  if (docData.pdfFile && docData.pdfFile instanceof File) {
    // Delete old file before uploading the new one (best-effort)
    const { data: existing } = await supabase
      .from('qr_documents')
      .select('pdf_file_path')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (existing?.pdf_file_path) {
      await supabase.storage.from('qr-documents').remove([existing.pdf_file_path]).catch(() => {});
    }

    // Sanitize filename - remove special characters and spaces
    const originalName = docData.pdfFileName || docData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Organize files by company, then by document type
    const fileName = `${companyId}/${docData.type}/${Date.now()}_${sanitizedName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('qr-documents')
      .upload(fileName, docData.pdfFile, {
        contentType: docData.pdfFile.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el archivo PDF');
    }

    if (uploadData) {
      pdfFilePath = uploadData.path;

      // Get signed URL (private bucket)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('qr-documents')
        .createSignedUrl(uploadData.path, 3600);
      if (urlError) throw urlError;

      pdfFileUrl = urlData.signedUrl;
    }
  }

  const updateData: TablesUpdate<'qr_documents'> = {
    document_name: docData.documentName,
    extracted_date: docData.extractedDate,
  };

  // Only update PDF fields if a new file was uploaded
  if (pdfFileUrl) {
    updateData.pdf_file_url = pdfFileUrl;
    updateData.pdf_file_path = pdfFilePath;
  }

  const { data, error } = await supabase
    .from('qr_documents')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapQRDocumentFromDb(data!);
};

export const deleteQRDocument = async (id: string): Promise<void> => {
  // Fetch file path before deleting the record
  const { data: doc } = await supabase
    .from('qr_documents')
    .select('pdf_file_path')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('qr_documents')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }

  // Clean up storage (best-effort)
  if (doc?.pdf_file_path) {
    await supabase.storage.from('qr-documents').remove([doc.pdf_file_path]).catch(() => { });
  }
};
