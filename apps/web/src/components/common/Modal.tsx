import { type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-xl',
  xl: 'sm:max-w-3xl',
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
      <DialogContent
        className={cn('p-0 gap-0 max-w-[calc(100vw-2rem)]', sizeClasses[size], className)}
      >
        {title && (
          <DialogHeader className="px-5 py-3.5 border-b border-border">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}

        <div className="px-5 py-4 max-h-[min(60vh,480px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {footer && (
          <DialogFooter className="px-5 py-3 border-t border-border bg-muted/50">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
