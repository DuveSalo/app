
import { supabase } from '../../supabase/client';
import { ConservationCertificate } from '../../../types/index';
import { mapCertificateFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyByUserId } from './company';
import { TablesUpdate } from '../../../types/database.types';

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

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload file to Supabase Storage if provided
  if (certData.pdfFile && certData.pdfFile instanceof File) {
    // Sanitize filename - remove special characters and spaces
    const originalName = certData.pdfFileName || certData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${company.id}/${Date.now()}_${sanitizedName}`;

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
      company_id: company.id,
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

  const company = await getCompanyByUserId(currentUser.id);

  let pdfFileUrl: string | null = null;
  let pdfFilePath: string | null = null;

  // Upload new file to Supabase Storage if provided
  if (certData.pdfFile && certData.pdfFile instanceof File) {
    // Sanitize filename - remove special characters and spaces
    const originalName = certData.pdfFileName || certData.pdfFile.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${company.id}/${Date.now()}_${sanitizedName}`;

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
  const { error } = await supabase
    .from('conservation_certificates')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }
};
