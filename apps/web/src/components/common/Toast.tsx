import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';

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

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const showToast = useCallback((msg: string, type: ToastType = 'info', description?: string) => {
    toast[type](msg, { description });
  }, []);

  const showSuccess = useCallback(
    (msg: string, description?: string) => toast.success(msg, { description }),
    []
  );
  const showError = useCallback(
    (msg: string, description?: string) => toast.error(msg, { description }),
    []
  );
  const showInfo = useCallback(
    (msg: string, description?: string) => toast.info(msg, { description }),
    []
  );
  const showWarning = useCallback(
    (msg: string, description?: string) => toast.warning(msg, { description }),
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
    </ToastContext.Provider>
  );
};
