
import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

const inputVariants = cva(
  'w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-slate-400',
  {
    variants: {
      hasError: {
        true: 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500/20 focus:border-red-500',
        false: 'border-slate-200 text-slate-900 focus:ring-slate-900/10 focus:border-slate-400',
      },
      disabled: {
        true: 'bg-slate-50 text-slate-500 cursor-not-allowed',
      },
    },
    defaultVariants: {
      hasError: false,
      disabled: false,
    },
  }
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  disabled,
  ...props
}) => {
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(inputVariants({ hasError, disabled, className }))}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
