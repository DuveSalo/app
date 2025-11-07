
import { supabase } from '../../supabase/client';
import { QRDocument, QRDocumentType } from '../../../types/index';
import { mapQRDocumentFromDb } from '../mappers';
import { AuthError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyByUserId } from './company';

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

export const uploadQRDocument = async (docData: Omit<QRDocument, 'id' | 'companyId' | 'uploadDate' | 'pdfUrl'>): Promise<QRDocument> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  const company = await getCompanyByUserId(currentUser.id);

  // TODO: Implement file upload to Supabase Storage
  // For now, we'll store a placeholder
  const { data, error } = await supabase
    .from('qr_documents')
    .insert({
      company_id: company.id,
      type: docData.type,
      document_name: docData.documentName,
      floor: docData.floor || null,
      unit: docData.unit || null,
      pdf_file_url: null, // Will be updated after storage upload
      pdf_file_path: null,
      qr_code_data: docData.qrCodeData || null,
      upload_date: new Date().toISOString().split('T')[0],
    })
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
