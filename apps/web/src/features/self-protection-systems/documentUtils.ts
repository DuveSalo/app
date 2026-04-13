import { openSupabaseStorageDocument } from '@/lib/utils/openSupabaseStorageDocument';

export interface SelfProtectionSystemDocumentReference {
  path?: string;
  url?: string;
}

export const openSelfProtectionSystemDocument = async ({
  path,
  url,
}: SelfProtectionSystemDocumentReference): Promise<void> => {
  return openSupabaseStorageDocument({
    bucket: 'self-protection-systems',
    path,
    url,
    title: 'Abriendo PDF',
    message: 'Preparando una vista segura del documento del sistema de autoprotección.',
  });
};
