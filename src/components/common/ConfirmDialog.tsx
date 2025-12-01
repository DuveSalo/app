
import React from 'react';
import { clsx } from 'clsx';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button, ButtonProps } from './Button';

const variantStyles = {
  danger: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    icon: AlertTriangle,
    button: 'danger' as ButtonProps['variant'],
  },
  warning: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    icon: AlertCircle,
    button: 'secondary' as ButtonProps['variant'],
  },
  info: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    icon: Info,
    button: 'primary' as ButtonProps['variant'],
  },
};

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

  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 transition-opacity animate-fade-in" aria-hidden="true">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        </div>

        <div className="relative bg-white rounded-2xl text-left shadow-xl transform transition-all max-w-md w-full animate-scale-in">
          <div className="p-6">
            <div className="flex gap-4">
              <div
                className={clsx(
                  'flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-xl',
                  styles.iconBg
                )}
              >
                <IconComponent className={clsx('h-5 w-5', styles.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900" id="modal-title">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{message}</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 rounded-b-2xl flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            <Button
              variant={styles.button}
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Procesando...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


