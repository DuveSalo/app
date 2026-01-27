
import { supabase } from '../../supabase/client';
import { SelfProtectionSystem } from '../../../types/index';
import { mapSystemFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyByUserId } from './company';
import { createLogger } from '../../utils/logger';
import { TablesUpdate } from '../../../types/database.types';

const logger = createLogger('SystemService');

export const getSelfProtectionSystems = async (companyId?: string): Promise<SelfProtectionSystem[]> => {
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
    .from('self_protection_systems')
    .select('*')
    .eq('company_id', finalCompanyId);

  if (error) {
    handleSupabaseError(error, 'Error al obtener sistemas de autoprotección');
  }

  return (data || []).map(mapSystemFromDb);
};

export const getSelfProtectionSystemById = async (id: string): Promise<SelfProtectionSystem> => {
  const { data, error } = await supabase
    .from('self_protection_systems')
    .select('*')
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

  const company = await getCompanyByUserId(currentUser.id);

  // Upload PDF files to Supabase Storage
  let probatoryPdfUrl: string | null = null;
  let extensionPdfUrl: string | null = null;
  const drillsWithUrls = [];

  // Upload probatory disposition PDF
  if (systemData.probatoryDispositionPdf && systemData.probatoryDispositionPdf instanceof File) {
    const originalName = systemData.probatoryDispositionPdfName || systemData.probatoryDispositionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${company.id}/probatory/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError} = await supabase.storage
      .from('self-protection-systems')
      .upload(fileName, systemData.probatoryDispositionPdf, {
        contentType: systemData.probatoryDispositionPdf.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el PDF de disposición probatoria');
    }

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from('self-protection-systems')
        .getPublicUrl(uploadData.path);
      probatoryPdfUrl = urlData.publicUrl;
    }
  }

  // Upload extension PDF
  if (systemData.extensionPdf && systemData.extensionPdf instanceof File) {
    const originalName = systemData.extensionPdfName || systemData.extensionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${company.id}/extension/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('self-protection-systems')
      .upload(fileName, systemData.extensionPdf, {
        contentType: systemData.extensionPdf.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el PDF de extensión');
    }

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from('self-protection-systems')
        .getPublicUrl(uploadData.path);
      extensionPdfUrl = urlData.publicUrl;
    }
  }

  // Upload drill PDFs
  for (const drill of systemData.drills || []) {
    let drillPdfUrl: string | null = null;

    if (drill.pdfFile && drill.pdfFile instanceof File) {
      const originalName = drill.pdfFileName || drill.pdfFile.name;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${company.id}/drills/${Date.now()}_${sanitizedName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('self-protection-systems')
        .upload(fileName, drill.pdfFile, {
          contentType: drill.pdfFile.type || 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        handleSupabaseError(uploadError, 'Error al subir el PDF del simulacro');
      }

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('self-protection-systems')
          .getPublicUrl(uploadData.path);
        drillPdfUrl = urlData.publicUrl;
      }
    }

    drillsWithUrls.push({
      date: drill.date,
      pdfFileName: drill.pdfFileName || null,
      pdfUrl: drillPdfUrl
    });
  }

  // Insert the record directly
  const { data, error } = await supabase
    .from('self_protection_systems')
    .insert({
      company_id: company.id,
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

  const company = await getCompanyByUserId(currentUser.id);

  // Upload PDF files to Supabase Storage
  let probatoryPdfUrl: string | null = null;
  let extensionPdfUrl: string | null = null;
  const drillsWithUrls = [];

  // Upload probatory disposition PDF if new file provided
  if (systemData.probatoryDispositionPdf && systemData.probatoryDispositionPdf instanceof File) {
    const originalName = systemData.probatoryDispositionPdfName || systemData.probatoryDispositionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${company.id}/probatory/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('self-protection-systems')
      .upload(fileName, systemData.probatoryDispositionPdf, {
        contentType: systemData.probatoryDispositionPdf.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el PDF de disposición probatoria');
    }

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from('self-protection-systems')
        .getPublicUrl(uploadData.path);
      probatoryPdfUrl = urlData.publicUrl;
    }
  }

  // Upload extension PDF if new file provided
  if (systemData.extensionPdf && systemData.extensionPdf instanceof File) {
    const originalName = systemData.extensionPdfName || systemData.extensionPdf.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${company.id}/extension/${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('self-protection-systems')
      .upload(fileName, systemData.extensionPdf, {
        contentType: systemData.extensionPdf.type || 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el PDF de extensión');
    }

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from('self-protection-systems')
        .getPublicUrl(uploadData.path);
      extensionPdfUrl = urlData.publicUrl;
    }
  }

  // Upload drill PDFs
  for (const drill of systemData.drills || []) {
    let drillPdfUrl: string | null = drill.pdfUrl || null;

    if (drill.pdfFile && drill.pdfFile instanceof File) {
      const originalName = drill.pdfFileName || drill.pdfFile.name;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${company.id}/drills/${Date.now()}_${sanitizedName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('self-protection-systems')
        .upload(fileName, drill.pdfFile, {
          contentType: drill.pdfFile.type || 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        handleSupabaseError(uploadError, 'Error al subir el PDF del simulacro');
      }

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('self-protection-systems')
          .getPublicUrl(uploadData.path);
        drillPdfUrl = urlData.publicUrl;
      }
    }

    drillsWithUrls.push({
      date: drill.date,
      pdfFileName: drill.pdfFileName || null,
      pdfUrl: drillPdfUrl
    });
  }

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
  const { error } = await supabase
    .from('self_protection_systems')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }
};
