
import { supabase } from '../../supabase/client';
import { SelfProtectionSystem } from '../../../types/index';
import { mapSystemFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyByUserId } from './company';

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

  // TODO: Upload PDF files to Supabase Storage and get URLs
  // For now, we'll just store the file names

  // Use RPC call to bypass schema cache issue
  const { data, error } = await supabase.rpc('create_self_protection_system', {
    p_company_id: company.id,
    p_probatory_disposition_date: systemData.probatoryDispositionDate || null,
    p_probatory_disposition_pdf_name: systemData.probatoryDispositionPdfName || null,
    p_extension_date: systemData.extensionDate,
    p_extension_pdf_name: systemData.extensionPdfName || null,
    p_expiration_date: systemData.expirationDate,
    p_drills: JSON.stringify(systemData.drills || []),
    p_intervener: systemData.intervener,
    p_registration_number: systemData.registrationNumber,
  });

  if (error) {
    handleSupabaseError(error);
  }

  // Fetch the created record
  const { data: createdData, error: fetchError } = await supabase
    .from('self_protection_systems')
    .select()
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError) {
    handleSupabaseError(fetchError);
  }

  return mapSystemFromDb(createdData);
};

export const updateSelfProtectionSystem = async (systemData: SelfProtectionSystem): Promise<SelfProtectionSystem> => {
  // TODO: Upload PDF files to Supabase Storage and get URLs
  // For now, we'll just store the file names

  const { data, error } = await supabase
    .from('self_protection_systems')
    .update({
      probatory_disposition_date: systemData.probatoryDispositionDate || null,
      probatory_disposition_pdf_name: systemData.probatoryDispositionPdfName || null,
      extension_date: systemData.extensionDate,
      extension_pdf_name: systemData.extensionPdfName || null,
      expiration_date: systemData.expirationDate,
      drills: systemData.drills || [],
      intervener: systemData.intervener,
      registration_number: systemData.registrationNumber,
    })
    .eq('id', systemData.id)
    .select()
    .single();

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
