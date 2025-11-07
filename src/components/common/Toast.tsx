
import React, { createContext, useContext, useState, useCallback } from 'react';
import { cva } from 'cva';
import { clsx } from 'clsx';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

const toastItemVariants = cva('p-4 rounded-r-lg shadow-lg flex items-start gap-3 animate-slide-in-right min-w-[320px]', {
  variants: {
    type: {
      success: 'bg-green-50 border-l-4 border-green-500 text-green-800',
      error: 'bg-red-50 border-l-4 border-red-500 text-red-800',
      info: 'bg-blue-50 border-l-4 border-blue-500 text-blue-800',
      warning: 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800',
    },
  },
});

const iconVariants = cva('w-5 h-5 flex-shrink-0 mt-0.5', {
  variants: {
    type: {
      success: 'text-green-500',
      error: 'text-red-500',
      info: 'text-blue-500',
      warning: 'text-yellow-500',
    },
  },
});

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, message, type };

      setToasts(prev => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const Icon = icons[toast.type];

  return (
    <div className={clsx(toastItemVariants({ type: toast.type }))} role="alert">
      <Icon className={clsx(iconVariants({ type: toast.type }))} />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="hover:opacity-70 transition-opacity flex-shrink-0"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};


