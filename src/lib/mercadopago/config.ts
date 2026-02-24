import { env } from '@/lib/env';

export const MP_PUBLIC_KEY = env.VITE_MP_PUBLIC_KEY;

/** Whether MercadoPago is configured (Public Key provided) */
export const isMpEnabled = !!MP_PUBLIC_KEY;
