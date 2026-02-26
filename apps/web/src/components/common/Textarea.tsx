import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-[100px] w-full rounded-lg border bg-white px-3.5 py-3 text-sm font-normal transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 resize-none shadow-xs',
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

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof textareaVariants>, 'hasError'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, disabled, rows = 4, ...props }, ref) => {
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
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={cn(textareaVariants({ hasError, className }))}
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

Textarea.displayName = 'Textarea';
