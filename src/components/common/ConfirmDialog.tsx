
import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { AlertTriangle } from 'lucide-react';
import { Button, ButtonProps } from './Button';

const dialogVariants = cva('', {
  variants: {
    variant: {
      danger: {
        icon: 'bg-red-100 text-red-600',
        button: 'danger' as ButtonProps['variant'],
      },
      warning: {
        icon: 'bg-yellow-100 text-yellow-600',
        button: 'secondary' as ButtonProps['variant'],
      },
      info: {
        icon: 'bg-blue-100 text-blue-600',
        button: 'primary' as ButtonProps['variant'],
      },
    },
  },
  defaultVariants: {
    variant: 'danger',
  },
});

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const styles = dialogVariants({ variant });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity animate-fade-in" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scale-in">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div
                className={clsx(
                  'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10',
                  styles.icon
                )}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <Button
              variant={styles.button}
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Procesando...' : confirmText}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto mt-3 sm:mt-0"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


