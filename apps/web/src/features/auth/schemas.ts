import { z } from 'zod';
import { isCabaProvince } from '@/constants/geographic-data';

// ─── Login ──────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, 'Email requerido').max(254).email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida').max(100),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register ───────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z.string().min(1, 'Nombre requerido').max(100),
    email: z.string().min(1, 'Email requerido').max(254).email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
    confirmPassword: z.string().min(1, 'Confirmar contraseña').max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── OTP (email verification) ────────────────────────────
export const otpSchema = z.object({
  token: z.string().min(6, 'Código requerido').max(6),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

const ARGENTINE_LOCATION_NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

const citySchema = z
  .string()
  .max(100)
  .refine(
    (value) => value.trim() === '' || ARGENTINE_LOCATION_NAME_REGEX.test(value),
    'Ciudad inválida.'
  );

// ─── Create Company ─────────────────────────────────────
export const createCompanySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio.')
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s0-9°#'-]+$/, 'Nombre inválido.'),
  cuit: z
    .string()
    .min(1, 'El CUIT es obligatorio.')
    .max(50)
    .regex(/^\d{2}-\d{8}-\d{1}$/, 'Formato inválido. Use XX-XXXXXXXX-X.'),
  address: z.string().min(1, 'La dirección es obligatoria.').max(500),
  postalCode: z
    .string()
    .min(1, 'El código postal es obligatorio.')
    .max(50)
    .regex(/^\d{4,8}$/, 'Entre 4 y 8 dígitos.'),
  city: citySchema,
  province: z.string().min(1, 'La provincia es obligatoria.').max(100),
  country: z.string().min(1, 'El país es obligatorio.').max(100),
  phone: z
    .string()
    .min(1, 'El teléfono es obligatorio.')
    .max(30)
    .regex(/^[\d\s\-+()]+$/, 'Formato de teléfono inválido.'),
  services: z.array(z.string().max(100)).max(50),
}).superRefine((data, ctx) => {
  if (!isCabaProvince(data.province) && data.city.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La ciudad es obligatoria.',
      path: ['city'],
    });
  }
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;

// ─── Reset Password ──────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(100)
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Confirmar contraseña').max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
