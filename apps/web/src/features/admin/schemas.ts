import { z } from 'zod';

export const planSchema = z.object({
  key: z
    .string()
    .min(1, 'La clave es obligatoria')
    .regex(/^[a-z0-9_-]+$/, 'Solo minúsculas, números, guiones'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  features: z.string().min(1, 'Ingresa al menos una característica'),
  sortOrder: z.number().min(0),
  description: z.string(),
  tag: z.string(),
  highlighted: z.boolean(),
});

export type PlanFormValues = z.infer<typeof planSchema>;
