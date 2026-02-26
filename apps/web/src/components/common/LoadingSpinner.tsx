import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export const LoadingSpinner = ({
  size = 'md',
  className
}: LoadingSpinnerProps) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin text-brand-700')} strokeWidth={2} />
    </div>
  );
};

export const PageLoader = ({ message }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-sm font-medium text-neutral-500 animate-pulse">{message}</p>
      )}
    </div>
  );
};
