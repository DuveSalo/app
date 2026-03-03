import { type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
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
  md: 'max-w-[calc(100vw-2rem)] sm:max-w-md',
  lg: 'max-w-[calc(100vw-2rem)] sm:max-w-xl',
  xl: 'max-w-[calc(100vw-2rem)] sm:max-w-3xl',
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
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-neutral-900/20 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg border border-neutral-200 shadow-lg p-0 gap-0 duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            sizeClasses[size],
            className
          )}
        >
          {title && (
            <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between">
              <DialogPrimitive.Title className="text-lg font-semibold text-neutral-900">
                {title}
              </DialogPrimitive.Title>
            </div>
          )}

          <div className="px-5 py-4 max-h-[min(60vh,480px)] overflow-y-auto custom-scrollbar">
            {children}
          </div>

          {footer && (
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-2">
              {footer}
            </div>
          )}

          <DialogPrimitive.Close
            className="absolute right-3 top-3 inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
