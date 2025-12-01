import { useState, useCallback } from 'react';

export interface UploadProgressState {
  isUploading: boolean;
  progress: number; // 0-100
  fileName: string | null;
}

export function useUploadProgress() {
  const [uploadState, setUploadState] = useState<UploadProgressState>({
    isUploading: false,
    progress: 0,
    fileName: null,
  });

  const startUpload = useCallback((fileName: string) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      fileName,
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setUploadState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
    }));
  }, []);

  const finishUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 100,
      fileName: null,
    });
    // Reset after a short delay
    setTimeout(() => {
      setUploadState({
        isUploading: false,
        progress: 0,
        fileName: null,
      });
    }, 500);
  }, []);

  const reset = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      fileName: null,
    });
  }, []);

  return {
    uploadState,
    startUpload,
    updateProgress,
    finishUpload,
    reset,
  };
}








