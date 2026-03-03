import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { toast, Toaster } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
  showToast: (msg: string, type?: ToastType, description?: string) => void;
  showSuccess: (msg: string, description?: string) => void;
  showError: (msg: string, description?: string) => void;
  showInfo: (msg: string, description?: string) => void;
  showWarning: (msg: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const toastConfig = {
  success: {
    icon: <CheckCircle className="h-4 w-4 text-green-600" strokeWidth={2} />,
  },
  error: {
    icon: <XCircle className="h-4 w-4 text-red-600" strokeWidth={2} />,
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" strokeWidth={2} />,
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-600" strokeWidth={2} />,
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const showToast = useCallback((msg: string, type: ToastType = 'info', description?: string) => {
    const config = toastConfig[type];

    toast(msg, {
      icon: config.icon,
      description,
      duration: 5000,
      className: 'border border-neutral-200 bg-white rounded-md shadow-md',
      descriptionClassName: 'text-xs text-neutral-500',
    });
  }, []);

  const showSuccess = useCallback(
    (msg: string, description?: string) => showToast(msg, 'success', description),
    [showToast]
  );
  const showError = useCallback(
    (msg: string, description?: string) => showToast(msg, 'error', description),
    [showToast]
  );
  const showInfo = useCallback(
    (msg: string, description?: string) => showToast(msg, 'info', description),
    [showToast]
  );
  const showWarning = useCallback(
    (msg: string, description?: string) => showToast(msg, 'warning', description),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            padding: '12px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#171717',
          },
        }}
      />
      {children}
    </ToastContext.Provider>
  );
};
