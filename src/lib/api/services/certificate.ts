
import { supabase } from '../../supabase/client';
import { ConservationCertificate } from '../../../types/index';
import { mapCertificateFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyByUserId } from './company';

export const getCertificates = async (companyId?: string): Promise<ConservationCertificate[]> => {
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
    .from('conservation_certificates')
    .select('*')
    .eq('company_id', finalCompanyId);

  if (error) {
    handleSupabaseError(error, 'Error al obtener certificados');
  }

  return (data || []).map(mapCertificateFromDb);
};

export const getCertificateById = async (id: string): Promise<ConservationCertificate> => {
  const { data, error } = await supabase
    .from('conservation_certificates')
    .select('*')
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

  const company = await getCompanyByUserId(currentUser.id);

  // TODO: Handle file upload to Supabase Storage
  const { data, error } = await supabase
    .from('conservation_certificates')
    .insert({
      company_id: company.id,
      presentation_date: certData.presentationDate,
      expiration_date: certData.expirationDate,
      intervener: certData.intervener,
      registration_number: certData.registrationNumber,
      pdf_file_url: null, // Will be updated after file upload
      pdf_file_path: null,
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
  const { data, error } = await supabase
    .from('conservation_certificates')
    .update({
      presentation_date: certData.presentationDate,
      expiration_date: certData.expirationDate,
      intervener: certData.intervener,
      registration_number: certData.registrationNumber,
      pdf_file_name: certData.pdfFileName || null,
    })
    .eq('id', certData.id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapCertificateFromDb(data);
};

export const deleteCertificate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('conservation_certificates')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }
};
