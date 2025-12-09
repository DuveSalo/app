
import React, { createContext, useContext, useCallback } from 'react';
import { message } from 'antd';

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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const showToast = useCallback(
    (msg: string, type: ToastType = 'info') => {
      const config = {
        content: msg,
        duration: 5,
        style: {
          borderRadius: 12,
        },
      };

      switch (type) {
        case 'success':
          messageApi.success(config);
          break;
        case 'error':
          messageApi.error(config);
          break;
        case 'warning':
          messageApi.warning(config);
          break;
        case 'info':
        default:
          messageApi.info(config);
          break;
      }
    },
    [messageApi]
  );

  const showSuccess = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const showError = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const showInfo = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
  const showWarning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {contextHolder}
      {children}
    </ToastContext.Provider>
  );
};
