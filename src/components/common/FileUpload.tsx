
import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, File as FileIcon, X } from 'lucide-react';

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

  const isValidFileType = (file: File): boolean => {
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    return acceptedTypes.some(type => {
      if (type.startsWith('.')) return fileName.endsWith(type);
      return fileType === type;
    });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE_MB}MB.`;
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {!displayFileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          className={`border-2 border-dashed rounded-xl py-12 px-6 text-center transition-all ${
            isDragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-1">
            Arrastra y suelta el archivo aquí, o
          </p>
          <label className="inline-flex items-center px-4 py-2 mt-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
            <span>Seleccionar archivo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-400 mt-3">PDF, PNG, JPG hasta {MAX_FILE_SIZE_MB}MB</p>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <FileIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 truncate" title={displayFileName}>
                {displayFileName}
              </span>
              {fileSize && 
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {fileSize}
                </span>
              }
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="text-gray-400 hover:text-red-600 transition-colors ml-2"
              aria-label="Clear file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


