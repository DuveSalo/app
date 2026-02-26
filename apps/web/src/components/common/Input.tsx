import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full h-10 rounded-lg border bg-white px-3.5 text-sm font-normal transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 shadow-xs',
  {
    variants: {
      hasError: {
        true: 'border-red-600 text-red-900 placeholder:text-red-300 focus-visible:ring-red-600/15 focus-visible:border-red-600',
        false: 'border-neutral-300 text-neutral-900 focus-visible:ring-brand-700/15 focus-visible:border-brand-600 hover:border-neutral-400',
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
  Omit<VariantProps<typeof inputVariants>, 'hasError'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, disabled, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          ref={ref}
          disabled={disabled}
          className={cn(inputVariants({ hasError, className }))}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
