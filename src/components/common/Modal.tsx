import React from 'react';
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
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  className,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(sizeClasses[size], 'p-0 gap-0', className)}>
        {title && (
          <DialogHeader className="px-6 py-4 border-b border-zinc-200">
            <DialogTitle className="text-lg font-semibold text-zinc-900">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <DialogFooter className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 rounded-b-lg">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
