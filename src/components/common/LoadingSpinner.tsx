
import React from 'react';
import { cva } from 'cva';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('animate-spin text-blue-600', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size, className }) => {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <Loader2 className={clsx(spinnerVariants({ size }))} />
    </div>
  );
};


