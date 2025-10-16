
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, id, error, helperText, className = '', ...props }) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    )}
    <textarea
      id={id}
      rows={4}
      className={`
        w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
        ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    {helperText && !error && (
      <p className="mt-1 text-sm text-gray-500">{helperText}</p>
    )}
  </div>
);

export default Textarea;
