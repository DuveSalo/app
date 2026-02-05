// Mercado Pago SDK configuration
import { initMercadoPago } from '@mercadopago/sdk-react';
import { env } from '../env';

let initialized = false;

export const initializeMercadoPago = (): boolean => {
  if (initialized) return true;

  const publicKey = env.VITE_MERCADOPAGO_PUBLIC_KEY;

  if (!publicKey) {
    console.error('[MercadoPago] VITE_MERCADOPAGO_PUBLIC_KEY is not configured');
    return false;
  }

  try {
    initMercadoPago(publicKey, {
      locale: 'es-AR',
    });
    initialized = true;
    console.log('[MercadoPago] SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('[MercadoPago] Failed to initialize SDK:', error);
    return false;
  }
};

export const isMercadoPagoInitialized = () => initialized;
