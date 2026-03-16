import { z } from 'zod';
import { pdfFileSchema } from '@/lib/schemas/common';

export const uploadQRDocumentSchema = z.object({
  pdfFile: pdfFileSchema,
  extractedDate: z
    .string({ error: 'Por favor, ingrese la fecha de emisión del documento.' })
    .min(1, 'Por favor, ingrese o verifique la fecha de emisión del documento.')
    .max(10)
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
});

export type UploadQRDocumentFormValues = z.infer<typeof uploadQRDocumentSchema>;

export const editQRDocumentSchema = z.object({
  pdfFile: pdfFileSchema.nullish(),
  extractedDate: z
    .string({ error: 'Por favor, ingrese la fecha de emisión del documento.' })
    .min(1, 'Por favor, ingrese la fecha de emisión del documento.')
    .max(10)
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
});

export type EditQRDocumentFormValues = z.infer<typeof editQRDocumentSchema>;
