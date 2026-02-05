import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeMercadoPago } from './config';
import { env } from '../env';

interface MercadoPagoContextType {
  isReady: boolean;
  publicKey: string | null;
  error: string | null;
}

const MercadoPagoContext = createContext<MercadoPagoContextType>({
  isReady: false,
  publicKey: null,
  error: null,
});

interface MercadoPagoProviderProps {
  children: React.ReactNode;
}

export const MercadoPagoProvider: React.FC<MercadoPagoProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicKey = env.VITE_MERCADOPAGO_PUBLIC_KEY || null;

  useEffect(() => {
    if (!publicKey) {
      // Don't set error if key is not configured - it's optional during development
      console.warn('[MercadoPago] Public key not configured');
      return;
    }

    const success = initializeMercadoPago();
    if (success) {
      setIsReady(true);
      setError(null);
    } else {
      setError('Failed to initialize Mercado Pago SDK');
    }
  }, [publicKey]);

  return (
    <MercadoPagoContext.Provider value={{ isReady, publicKey, error }}>
      {children}
    </MercadoPagoContext.Provider>
  );
};

export const useMercadoPago = (): MercadoPagoContextType => {
  const context = useContext(MercadoPagoContext);
  if (!context) {
    throw new Error('useMercadoPago must be used within a MercadoPagoProvider');
  }
  return context;
};
