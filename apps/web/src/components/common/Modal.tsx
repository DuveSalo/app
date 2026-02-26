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
      <DialogContent className={cn(sizeClasses[size], 'p-0 gap-0 rounded-2xl shadow-xl', className)}>
        {title && (
          <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5 border-b border-neutral-200">
            <DialogTitle className="text-base font-semibold text-neutral-900 tracking-tight font-[family-name:var(--font-heading)]">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}
        <div className="px-5 py-4 sm:px-6 sm:py-5 max-h-[min(60vh,500px)] overflow-y-auto custom-scrollbar">{children}</div>
        {footer && (
          <DialogFooter className="px-5 py-4 sm:px-6 sm:py-5 border-t border-neutral-200 bg-neutral-50 flex-col-reverse sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
