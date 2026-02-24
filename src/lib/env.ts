import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_GEMINI_API_KEY: z.string().optional(),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  VITE_PAYPAL_CLIENT_ID: z.string().min(1),
  VITE_MP_PUBLIC_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
  VITE_PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  VITE_MP_PUBLIC_KEY: import.meta.env.VITE_MP_PUBLIC_KEY,
});

export type Env = z.infer<typeof envSchema>;
