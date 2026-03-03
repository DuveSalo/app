import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantStyles = {
  danger: {
    icon: AlertCircle,
    iconBg: 'bg-red-50',
    iconBorder: 'border-red-200',
    iconColor: 'text-red-600',
    buttonVariant: 'destructive' as const,
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
    buttonVariant: 'default' as const,
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
  title = 'Estas seguro?',
  message = 'Esta accion no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md p-0 gap-0 rounded-lg bg-white border border-neutral-200 shadow-lg [&>button]:hidden">
        <AlertDialogHeader className="px-5 py-3.5 pb-3">
          <div className="flex gap-3.5">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                styles.iconBg,
                styles.iconBorder
              )}
            >
              <Icon className={cn('h-5 w-5', styles.iconColor)} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialogTitle className="text-sm font-semibold text-neutral-900 mb-0.5">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-neutral-500 leading-relaxed">
                {message}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-5 py-3.5 border-t border-neutral-200 bg-neutral-50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            variant={styles.buttonVariant}
            size="sm"
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
