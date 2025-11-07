
import React from 'react';
import { cva } from 'cva';
import { clsx } from 'clsx';

const textareaVariants = cva(
  'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  {
    variants: {
      hasError: {
        true: 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500',
        false: 'border-gray-300',
      },
      disabled: {
        true: 'bg-gray-100 cursor-not-allowed',
      },
    },
    defaultVariants: {
      hasError: false,
      disabled: false,
    },
  }
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, error, helperText, className, disabled, ...props }) => {
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={clsx(textareaVariants({ hasError, disabled, className }))}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};


