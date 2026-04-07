import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';

export const SYSTEM_STORAGE_BUCKET = 'self-protection-systems';
export const SYSTEM_DOCUMENT_TTL_SECONDS = 3600;

export const createSystemDocumentSignedUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(SYSTEM_STORAGE_BUCKET)
    .createSignedUrl(path, SYSTEM_DOCUMENT_TTL_SECONDS);

  if (error) {
    handleSupabaseError(error, 'Error al obtener el PDF del sistema');
  }

  if (!data?.signedUrl) {
    throw new Error('No se pudo generar la URL del documento');
  }

  return data.signedUrl;
};

export const getSelfProtectionSystemDocumentUrl = async (path: string): Promise<string> =>
  createSystemDocumentSignedUrl(path);
