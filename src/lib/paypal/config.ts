import { env } from '../env';

export const PAYPAL_CLIENT_ID = env.VITE_PAYPAL_CLIENT_ID;

export const paypalScriptOptions = {
  clientId: PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'subscription' as const,
  vault: true,
};
