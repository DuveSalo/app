import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full h-10 rounded-md border px-3 text-sm transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400',
  {
    variants: {
      hasError: {
        true: 'border-red-500 text-neutral-900 focus-visible:ring-red-500/10',
        false: 'border-neutral-200 text-neutral-900 focus-visible:ring-neutral-900/10 focus-visible:border-neutral-400 hover:border-neutral-300',
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
            className="block text-sm font-medium text-neutral-900 mb-1.5"
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
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
