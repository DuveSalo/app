import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './Button';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantStyles = {
  danger: {
    icon: AlertCircle,
    iconBg: 'bg-red-50',
    iconBorder: 'border-red-200',
    iconColor: 'text-red-600',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-200',
    iconColor: 'text-amber-600',
    buttonVariant: 'secondary' as const,
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-200',
    iconColor: 'text-blue-600',
    buttonVariant: 'primary' as const,
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

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md p-0 gap-0 rounded-2xl shadow-xl">
        <AlertDialogHeader className="p-6 pb-4">
          <div className="flex gap-4">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
                styles.iconBg,
                styles.iconBorder
              )}
            >
              <Icon className={cn('h-5 w-5', styles.iconColor)} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialogTitle className="text-base font-semibold text-neutral-900 mb-1 tracking-tight font-[family-name:var(--font-heading)]">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-neutral-500 leading-relaxed">
                {message}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            variant={styles.buttonVariant}
            onClick={onConfirm}
            loading={isLoading}
            className="flex-1 sm:flex-none"
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
