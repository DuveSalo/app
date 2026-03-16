import { z } from 'zod';
import { pdfFileSchema } from '@/lib/schemas/common';

export const conservationCertificateSchema = z
  .object({
    presentationDate: z.string().min(1, 'Fecha de presentación requerida').max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
    expirationDate: z.string().min(1, 'Fecha de vencimiento requerida').max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
    intervener: z.string().min(1, 'Personal interviniente requerido').max(100),
    registrationNumber: z.string().min(1, 'Matrícula requerida').max(50),
    pdfFile: pdfFileSchema.optional(),
    pdfFileName: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.presentationDate && data.expirationDate) {
        return new Date(data.expirationDate) > new Date(data.presentationDate);
      }
      return true;
    },
    {
      message: 'La fecha de vencimiento debe ser posterior a la de presentación',
      path: ['expirationDate'],
    }
  );

export type ConservationCertificateFormData = z.infer<typeof conservationCertificateSchema>;
