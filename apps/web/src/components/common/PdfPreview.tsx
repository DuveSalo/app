import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

export const PdfPreview = ({ file }: { file: File | string | null | undefined }) => {
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
    <div className="mt-3">
      <h4 className="text-sm font-medium text-neutral-900 mb-1.5">Vista previa del PDF</h4>
      <div className="w-full h-96 rounded-md border border-neutral-200 bg-neutral-50 relative overflow-hidden">
        {loading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
              <span className="text-xs text-neutral-500">Cargando vista previa...</span>
            </div>
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2.5 text-center px-6">
              <div className="w-9 h-9 bg-neutral-100 rounded-md border border-neutral-200 flex items-center justify-center">
                <FileText className="w-4 h-4 text-neutral-500" strokeWidth={2} />
              </div>
              <p className="text-sm text-neutral-500">No se pudo cargar la vista previa.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-neutral-900 hover:bg-neutral-100 px-3 py-1.5 rounded-md border border-neutral-200 transition-colors duration-150"
              >
                Abrir PDF
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
