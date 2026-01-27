import React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  error,
  helperText,
  required,
  children,
  className,
  horizontal = false,
}) => {
  return (
    <div className={cn(
      'w-full',
      horizontal && 'sm:grid sm:grid-cols-3 sm:items-start sm:gap-4',
      className
    )}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            'block text-sm font-medium text-gray-700',
            !horizontal && 'mb-1.5',
            horizontal && 'sm:pt-2.5'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={cn(horizontal && 'sm:col-span-2')}>
        {children}
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    </div>
  );
};

// Field Group for grouping multiple fields
interface FieldGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Field Row for inline fields
interface FieldRowProps {
  children: React.ReactNode;
  className?: string;
}

export const FieldRow: React.FC<FieldRowProps> = ({ children, className }) => {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  );
};
