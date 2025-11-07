
import React, { useState, useEffect } from 'react';
import { Upload, File as FileIcon, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  currentFileName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  accept = '.pdf',
  label = 'Subir archivo',
  currentFileName
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayFileName, setDisplayFileName] = useState<string | null>(currentFileName || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayFileName(currentFileName || null);
    if (!currentFileName) {
        setSelectedFile(null);
    }
  }, [currentFileName]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setDisplayFileName(file.name);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      setDisplayFileName(null);
      onFileSelect(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Arrastra y suelta el archivo aquí, o
          </p>
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <span>Seleccionar archivo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
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
              className="text-gray-400 hover:text-red-500 transition-colors ml-2"
              aria-label="Clear file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


