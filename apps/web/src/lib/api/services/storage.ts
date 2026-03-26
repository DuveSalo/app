import { supabase } from '../../supabase/client';

export const getSignedUrl = async (bucket: string, path: string): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
};
