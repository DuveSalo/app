import { z } from 'zod';

export const MAX_FILE_SIZE_PDF = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_IMAGE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_PDF_TYPES = ['application/pdf'];
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const pdfFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE_PDF, 'El archivo no debe superar 10MB')
  .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), 'Solo se aceptan archivos PDF');

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE_IMAGE, 'La imagen no debe superar 5MB')
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Solo se aceptan imagenes JPG, PNG o WebP'
  );
