import { z } from 'zod';
import { isCabaProvince } from '@/constants/geographic-data';

const ARGENTINE_LOCATION_NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

const citySchema = z
  .string()
  .max(100)
  .refine(
    (value) => value.trim() === '' || ARGENTINE_LOCATION_NAME_REGEX.test(value),
    'Solo se permiten letras y espacios.'
  );

export const companyInfoSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio.')
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'Solo se permiten letras y espacios.'),
  cuit: z
    .string()
    .min(1, 'El CUIT es obligatorio.')
    .max(50)
    .regex(/^\d{2}-\d{8}-\d{1}$/, 'Formato de CUIT inválido. Use XX-XXXXXXXX-X.'),
  postalCode: z
    .string()
    .min(1, 'El código postal es obligatorio.')
    .max(50)
    .regex(/^[a-zA-Z0-9]{4,8}$/, 'El código postal debe tener entre 4 y 8 caracteres.'),
  address: z.string().min(1, 'La dirección es obligatoria.').max(500),
  city: citySchema,
  province: z
    .string()
    .min(1, 'La provincia es obligatoria.')
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'Solo se permiten letras y espacios.'),
  country: z
    .string()
    .min(1, 'El país es obligatorio.')
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'Solo se permiten letras y espacios.'),
  phone: z
    .string()
    .max(30)
    .regex(/^[\d\s\-+()]*$/, 'Formato de teléfono inválido.')
    .or(z.literal('')),
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

export type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;

export const employeeSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.').max(100),
  email: z.string().min(1, 'El email es obligatorio.').max(254).email('Ingresá un email válido.'),
  role: z.string().min(1, 'El rol es obligatorio.').max(500),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

// ─── Change Email ────────────────────────────────────────
export const changeEmailSchema = z.object({
  newEmail: z.string().min(1, 'Email requerido').max(254).email('Email inválido'),
});

export type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;
