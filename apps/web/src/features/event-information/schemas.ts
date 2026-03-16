import { z } from 'zod';

export const eventInformationSchema = z.object({
  date: z.string().min(1, 'Fecha requerida').max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
  time: z.string().min(1, 'Horario requerido').max(50),
  description: z.string().min(1, 'Descripción requerida').max(2000),
  correctiveActions: z.string().min(1, 'Acciones correctivas requeridas').max(2000),
  physicalEvidenceDescription: z.string().max(2000).optional().or(z.literal('')),
  testimonials: z.array(z.object({ value: z.string().max(500) })).max(50),
  observations: z.array(z.object({ value: z.string().max(500) })).max(50),
  finalChecks: z.object({
    usoMatafuegos: z.boolean(),
    requerimientosServicios: z.boolean(),
    danoPersonas: z.boolean(),
    danosEdilicios: z.boolean(),
    evacuacion: z.boolean(),
  }),
});

export type EventInformationFormData = z.infer<typeof eventInformationSchema>;
