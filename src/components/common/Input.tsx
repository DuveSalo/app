
import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

const inputVariants = cva(
  'w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-zinc-400',
  {
    variants: {
      hasError: {
        true: 'border-rose-300 text-rose-900 placeholder-rose-300 focus:ring-rose-500/20 focus:border-rose-500',
        false: 'border-zinc-200 text-zinc-900 focus:ring-zinc-900/10 focus:border-zinc-400',
      },
      disabled: {
        true: 'bg-zinc-50 text-zinc-500 cursor-not-allowed',
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
        <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(inputVariants({ hasError, disabled, className }))}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-zinc-500">{helperText}</p>
      )}
    </div>
  );
};
