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
    icon: <CheckCircle className="h-5 w-5 text-brand-700" strokeWidth={2} />,
    className: 'bg-brand-50 border-brand-200',
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-700" strokeWidth={2} />,
    className: 'bg-red-50 border-red-200',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={2} />,
    className: 'bg-amber-50 border-amber-200',
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-700" strokeWidth={2} />,
    className: 'bg-blue-50 border-blue-200',
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    const config = toastConfig[type];

    toast(msg, {
      icon: config.icon,
      duration: 5000,
      className: `${config.className} border rounded-xl text-neutral-800 font-medium text-sm shadow-md`,
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
