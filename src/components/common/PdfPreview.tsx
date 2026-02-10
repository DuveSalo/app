
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

export const PdfPreview: React.FC<{ file: File | string | null | undefined }> = ({ file }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    setLoading(true);
    setHasError(false);

    if (file instanceof File) {
      objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    } else if (typeof file === 'string' && (file.startsWith('http') || file.startsWith('blob:'))) {
      setUrl(file);
    } else {
      setUrl(null);
      setLoading(false);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  if (!url) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-400 mb-2">Vista Previa del PDF</h4>
      <div className="w-full h-96 border border-gray-200 rounded-xl bg-gray-100 relative overflow-hidden">
        {loading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Cargando vista previa...</span>
            </div>
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No se pudo cargar la vista previa.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
              >
                Abrir PDF en nueva pestaña
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            title="Vista previa del PDF"
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setHasError(true); }}
          />
        )}
      </div>
    </div>
  );
};


