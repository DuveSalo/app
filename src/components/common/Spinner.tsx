import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      color: {
        default: 'text-zinc-600',
        primary: 'text-zinc-900',
        white: 'text-white',
        muted: 'text-zinc-400',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size,
  color,
  label,
  className,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label={label || 'Cargando'}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <div className={cn(spinnerVariants({ size, color }))} />
      {label && (
        <span className="ml-2 text-sm text-zinc-500">{label}</span>
      )}
      <span className="sr-only">{label || 'Cargando...'}</span>
    </div>
  );
};

// Full page spinner
export const PageSpinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-zinc-500 animate-pulse">{message}</p>
      )}
    </div>
  );
};

// Inline spinner with text
export const InlineSpinner: React.FC<{ text?: string; className?: string }> = ({
  text = 'Cargando...',
  className,
}) => {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm text-zinc-500', className)}>
      <Spinner size="sm" />
      {text}
    </span>
  );
};

// Button spinner (for use inside buttons)
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return <Spinner size="sm" color="white" className={className} />;
};

// Overlay spinner
export const OverlaySpinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        {message && (
          <p className="text-sm font-medium text-zinc-700">{message}</p>
        )}
      </div>
    </div>
  );
};
