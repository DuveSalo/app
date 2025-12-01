import { supabase } from '../supabase/client';
import { handleSupabaseError } from './errors';

export interface UploadProgress {
  progress: number; // 0-100
  loaded: number;
  total: number;
}

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  contentType?: string;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Uploads a file to Supabase Storage with progress tracking
 * Note: Supabase Storage doesn't support native progress events,
 * so we simulate progress for better UX
 */
export async function uploadFileWithProgress(
  options: UploadOptions
): Promise<{ path: string; publicUrl: string }> {
  const { bucket, path, file, contentType, onProgress } = options;

  // Simulate initial progress
  if (onProgress) {
    onProgress({ progress: 0, loaded: 0, total: file.size });
  }

  // Start upload
  const uploadPromise = supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: contentType || file.type,
      upsert: false,
    });

  // Simulate progress (since Supabase doesn't provide real progress events)
  // We'll update progress at intervals
  const progressInterval = setInterval(() => {
    if (onProgress) {
      // Simulate progress: start at 10%, gradually increase
      const simulatedProgress = Math.min(90, 10 + Math.random() * 80);
      onProgress({
        progress: simulatedProgress,
        loaded: (file.size * simulatedProgress) / 100,
        total: file.size,
      });
    }
  }, 200);

  try {
    const { data: uploadData, error: uploadError } = await uploadPromise;

    clearInterval(progressInterval);

    if (uploadError) {
      handleSupabaseError(uploadError, 'Error al subir el archivo');
      throw uploadError;
    }

    if (!uploadData) {
      throw new Error('No se recibieron datos del upload');
    }

    // Complete progress
    if (onProgress) {
      onProgress({ progress: 100, loaded: file.size, total: file.size });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    return {
      path: uploadData.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
}








