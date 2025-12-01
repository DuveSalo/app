import React from 'react';

interface UploadProgressProps {
  progress: number; // 0-100
  fileName?: string;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ 
  progress, 
  fileName,
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {fileName && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 truncate flex-1 mr-2">{fileName}</span>
          <span className="text-gray-500 font-medium">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};








