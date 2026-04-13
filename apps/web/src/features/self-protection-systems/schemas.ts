import { z } from 'zod';
import { pdfFileSchema } from '@/lib/schemas/common';

const drillSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida').max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
  pdfFile: pdfFileSchema.optional(),
  pdfFileName: z.string().max(500).optional(),
  pdfUrl: z.string().max(2000).optional(),
  pdfPath: z.string().max(2000).optional(),
});

export const selfProtectionSystemSchema = z.object({
  // Principal tab
  probatoryDispositionDate: z.string().min(1, 'La fecha es requerida').max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }),
  probatoryDispositionPdf: pdfFileSchema.optional(),
  probatoryDispositionPdfName: z.string().max(500).optional(),
  probatoryDispositionPdfUrl: z.string().max(2000).optional(),
  probatoryDispositionPdfPath: z.string().max(2000).optional(),
  extensionDate: z.string().max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }).or(z.literal('')),
  extensionPdf: pdfFileSchema.optional(),
  extensionPdfName: z.string().max(500).optional(),
  extensionPdfUrl: z.string().max(2000).optional(),
  extensionPdfPath: z.string().max(2000).optional(),
  expirationDate: z.string().max(10).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Formato de fecha inválido' }).or(z.literal('')),

  // Simulacros tab
  drills: z.array(drillSchema).length(4),

  // Profesional tab
  intervener: z.string().min(1, 'El personal interviniente es requerido').max(100),
  registrationNumber: z.string().min(1, 'La matrícula es requerida').max(50),
});

export type SelfProtectionSystemFormValues = z.infer<typeof selfProtectionSystemSchema>;

/** Fields per tab for trigger-based validation */
export const PRINCIPAL_FIELDS = ['probatoryDispositionDate'] as const;
export const SIMULACROS_FIELDS = [
  'drills.0.date',
  'drills.1.date',
  'drills.2.date',
  'drills.3.date',
] as const;
export const PROFESIONAL_FIELDS = ['intervener', 'registrationNumber'] as const;
