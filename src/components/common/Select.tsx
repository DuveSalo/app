import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'flex w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-all duration-150 appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
  {
    variants: {
      hasError: {
        true: 'border-red-300 text-red-900 focus-visible:ring-red-500/20 focus-visible:border-red-500',
        false: 'border-gray-200 text-gray-900 focus-visible:ring-gray-900/10 focus-visible:border-gray-400',
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
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            disabled={disabled}
            className={cn(selectVariants({ hasError }), 'pr-10', className)}
            {...props}
          >
            {options ? (
              <>
                <option value="" disabled>{placeholder}</option>
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
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
