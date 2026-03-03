import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'flex w-full h-10 rounded-md border bg-white px-3 text-sm appearance-none cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed',
  {
    variants: {
      hasError: {
        true: 'border-red-500 text-neutral-900 focus-visible:ring-red-500/10 focus-visible:border-red-500',
        false: 'border-neutral-200 text-neutral-900 focus-visible:ring-neutral-900/10 focus-visible:border-neutral-400 hover:border-neutral-300',
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
  children?: ReactNode;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, error, helperText, options, children, className, disabled, placeholder = 'Seleccione...', ...props }, ref) => {
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
        <div className="relative">
          <select
            id={id}
            ref={ref}
            disabled={disabled}
            className={cn(selectVariants({ hasError }), 'pr-9', className)}
            {...props}
          >
            {options ? (
              <>
                <option value="" disabled className="text-neutral-400">{placeholder}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </>
            ) : (
              children
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
