import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, File as FileIcon, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ACCEPTED_PDF_TYPES,
  ACCEPTED_IMAGE_TYPES,
} from '@/lib/schemas/common';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  currentFileName?: string;
}

export const FileUpload = ({
  onFileSelect,
  accept = '.pdf',
  label = 'Subir archivo',
  currentFileName
}: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayFileName, setDisplayFileName] = useState<string | null>(currentFileName || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayFileName(currentFileName || null);
    if (!currentFileName) {
      setSelectedFile(null);
    }
  }, [currentFileName]);

  const allowedMimeTypes = [...ACCEPTED_PDF_TYPES, ...ACCEPTED_IMAGE_TYPES];

  const isValidFileType = (file: File): boolean => {
    const fileType = file.type.toLowerCase();

    // Check against known safe MIME types
    if (!allowedMimeTypes.includes(fileType)) {
      return false;
    }

    // Also check against the accept prop (extension or MIME)
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    return acceptedTypes.some(type => {
      if (type.startsWith('.')) return fileName.endsWith(type);
      return fileType === type;
    });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `El archivo excede el tamano maximo de ${MAX_FILE_SIZE_MB}MB.`;
    }
    if (!isValidFileType(file)) {
      return `Tipo de archivo no permitido. Formatos aceptados: ${accept}`;
    }
    return null;
  };

  const handleFileChange = (file: File | null) => {
    setError(null);
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        toast.error('Tipo de archivo no permitido');
        return;
      }
      setSelectedFile(file);
      setDisplayFileName(file.name);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      setDisplayFileName(null);
      onFileSelect(null);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFileChange(files && files.length > 0 ? files[0] : null);
  };

  const clearFile = () => {
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileSize = selectedFile ? `(${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}

      {!displayFileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          className={cn(
            'rounded-lg border border-dashed py-8 px-6 text-center transition-colors duration-150',
            isDragOver
              ? 'border-border bg-neutral-50'
              : 'border-border hover:border-border hover:bg-neutral-50'
          )}
        >
          <div className="w-9 h-9 rounded-md border border-border bg-muted flex items-center justify-center mx-auto mb-2.5">
            <Upload className="w-4 h-4 text-neutral-500" strokeWidth={2} />
          </div>
          <p className="text-sm text-neutral-900 font-medium mb-1">
            Arrastra y suelta el archivo aqui, o
          </p>
          <label className="inline-flex items-center rounded-md px-3 py-1.5 mt-1.5 border border-border text-sm font-medium text-neutral-900 bg-white hover:bg-neutral-50 cursor-pointer transition-colors duration-150">
            <span>Seleccionar archivo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <p className="text-xs text-neutral-500 mt-2.5">PDF, PNG, JPG hasta {MAX_FILE_SIZE_MB}MB</p>
          {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        </div>
      ) : (
        <div className="rounded-md border border-border px-3.5 py-2.5 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileIcon className="w-4 h-4 text-neutral-500 flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium text-neutral-900 truncate" title={displayFileName}>
                {displayFileName}
              </span>
              {fileSize &&
                <span className="text-xs text-neutral-500 flex-shrink-0">
                  {fileSize}
                </span>
              }
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    const url = URL.createObjectURL(selectedFile);
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors duration-150 flex items-center gap-1 text-xs px-1.5 py-1 rounded-md hover:bg-neutral-100"
                  aria-label="Ver PDF"
                >
                  <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Ver</span>
                </button>
              )}
              <button
                type="button"
                onClick={clearFile}
                className="text-neutral-400 hover:text-red-600 transition-colors duration-150 p-1 rounded-md hover:bg-red-50"
                aria-label="Clear file"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
