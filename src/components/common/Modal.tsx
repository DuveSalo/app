import { type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-[calc(100vw-2rem)] sm:max-w-sm',
  md: 'max-w-[calc(100vw-2rem)] sm:max-w-lg',
  lg: 'max-w-[calc(100vw-2rem)] sm:max-w-2xl',
  xl: 'max-w-[calc(100vw-2rem)] sm:max-w-4xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  className,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(sizeClasses[size], 'p-0 gap-0', className)}>
        {title && (
          <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
            <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}
        <div className="px-4 py-3 sm:px-6 sm:py-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <DialogFooter className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
