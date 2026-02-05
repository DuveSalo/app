
import React, { useState, useEffect } from 'react';

export const PdfPreview: React.FC<{ file: File | string | null | undefined }> = ({ file }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (file instanceof File) {
      objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    } else if (typeof file === 'string' && (file.startsWith('http') || file.startsWith('blob:'))) {
      setUrl(file);
    } else {
      setUrl(null);
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
      <div className="w-full h-96 border border-gray-200 rounded-md bg-gray-100">
        <embed src={url} type="application/pdf" width="100%" height="100%" />
      </div>
    </div>
  );
};


