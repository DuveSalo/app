import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { toast, Toaster } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
  showToast: (msg: string, type?: ToastType) => void;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  showInfo: (msg: string) => void;
  showWarning: (msg: string) => void;
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
    icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    className: 'border-emerald-200 bg-emerald-50',
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    className: 'border-red-200 bg-red-50',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    className: 'border-amber-200 bg-amber-50',
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-600" />,
    className: 'border-blue-200 bg-blue-50',
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    const config = toastConfig[type];

    toast(msg, {
      icon: config.icon,
      duration: 5000,
      className: `${config.className} border rounded-lg shadow-lg`,
    });
  }, []);

  const showSuccess = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const showError = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const showInfo = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
  const showWarning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />
      {children}
    </ToastContext.Provider>
  );
};
