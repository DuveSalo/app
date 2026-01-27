
import { supabase } from '../../supabase/client';
import { QRDocument, QRDocumentType, QRDocumentCreate } from '../../../types/index';
import { mapQRDocumentFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyByUserId } from './company';
import { TablesUpdate } from '../../../types/database.types';

export const getQRDocuments = async (type: QRDocumentType, companyId?: string): Promise<QRDocument[]> => {
  const allDocs = await getAllQRDocuments(companyId);
  return allDocs.filter(d => d.type === type);
};

export const getAllQRDocuments = async (companyId?: string): Promise<QRDocument[]> => {
  let finalCompanyId = companyId;

  if (!finalCompanyId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new AuthError('Usuario no autenticado');
    }
    const company = await getCompanyByUserId(currentUser.id);
    finalCompanyId = company.id;
  }

  const { data, error } = await supabase
    .from('qr_documents')
    .select('*')
    .eq('company_id', finalCompanyId);

  if (error) {
    handleSupabaseError(error, 'Error al obtener documentos QR');
  }

  return (data || []).map(mapQRDocumentFromDb);
};

export const uploadQRDocument = async (docData: QRDocumentCreate): Promise<QRDocument> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  const company = await getCompanyByUserId(currentUser.id);

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload file to Supabase Storage if provided
  if (docData.pdfFile && docData.pdfFile instanceof File) {
    // Sanitize filename - remove special characters and spaces
    const originalName = docData.pdfFileName || docData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Organize files by company, then by document type
    const fileName = `${company.id}/${docData.type}/${Date.now()}_${sanitizedName}`;

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

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('qr-documents')
        .getPublicUrl(uploadData.path);

      pdfFileUrl = urlData.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from('qr_documents')
    .insert({
      company_id: company.id,
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

  return mapQRDocumentFromDb(data);
};

export const getQRDocumentById = async (id: string): Promise<QRDocument> => {
  const { data, error } = await supabase
    .from('qr_documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new NotFoundError('Documento QR no encontrado', 'qr_document');
  }

  return mapQRDocumentFromDb(data);
};

export const updateQRDocument = async (id: string, docData: Partial<QRDocumentCreate>): Promise<QRDocument> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  const company = await getCompanyByUserId(currentUser.id);

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload new file to Supabase Storage if provided
  if (docData.pdfFile && docData.pdfFile instanceof File) {
    // Sanitize filename - remove special characters and spaces
    const originalName = docData.pdfFileName || docData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Organize files by company, then by document type
    const fileName = `${company.id}/${docData.type}/${Date.now()}_${sanitizedName}`;

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

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('qr-documents')
        .getPublicUrl(uploadData.path);

      pdfFileUrl = urlData.publicUrl;
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
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapQRDocumentFromDb(data);
};

export const deleteQRDocument = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('qr_documents')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }
};
