
// Date validation utilities

/**
 * Parse date as local time to avoid timezone issues
 * YYYY-MM-DD format is parsed as UTC by default, which can cause
 * "today" to become "yesterday" in negative UTC timezones
 */
const parseLocalDate = (dateString: string): Date => {
  const dateStr = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  return new Date(dateStr);
};

export const validateDateRange = (startDate: string, endDate: string): { valid: boolean; error?: string } => {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Fechas inválidas' };
  }

  if (end <= start) {
    return { valid: false, error: 'La fecha de vencimiento debe ser posterior a la fecha de presentación' };
  }

  return { valid: true };
};

export const validateExpirationDate = (expirationDate: string, presentationDate?: string): { valid: boolean; error?: string } => {
  const expiry = parseLocalDate(expirationDate);

  if (isNaN(expiry.getTime())) {
    return { valid: false, error: 'Fecha de vencimiento inválida' };
  }

  if (presentationDate) {
    const presentation = parseLocalDate(presentationDate);
    if (expiry <= presentation) {
      return { valid: false, error: 'La fecha de vencimiento debe ser posterior a la fecha de presentación' };
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiry < today) {
    return { valid: false, error: 'La fecha de vencimiento no puede estar en el pasado' };
  }

  return { valid: true };
};

export const validateFutureDate = (date: string): { valid: boolean; error?: string } => {
  const inputDate = parseLocalDate(date);

  if (isNaN(inputDate.getTime())) {
    return { valid: false, error: 'Fecha inválida' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return { valid: false, error: 'La fecha no puede estar en el pasado' };
  }

  return { valid: true };
};

export const validatePastDate = (date: string): { valid: boolean; error?: string } => {
  const inputDate = parseLocalDate(date);

  if (isNaN(inputDate.getTime())) {
    return { valid: false, error: 'Fecha inválida' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate > today) {
    return { valid: false, error: 'La fecha no puede estar en el futuro' };
  }

  return { valid: true };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<[^>]*>/g, '');
};

export const sanitizeHtml = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.textContent = html;
  return tempDiv.textContent || '';
};

// Email validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Email inválido' };
  }

  return { valid: true };
};

// Phone validation
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  if (!/^\d{8,15}$/.test(cleanPhone)) {
    return { valid: false, error: 'Número de teléfono inválido' };
  }

  return { valid: true };
};

// Required field validation
export const validateRequired = (value: unknown, fieldName: string = 'Campo'): { valid: boolean; error?: string } => {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} es requerido` };
  }

  return { valid: true };
};

// Expiration-specific validations
import { calculateDaysUntilExpiration } from './dateUtils';
import { EXPIRATION_CONFIG } from '../constants';

/**
 * Valida que una fecha de vencimiento sea posterior a una fecha de presentación
 */
export const validateExpirationDateRange = (
  presentationDate: string,
  expirationDate: string
): { valid: boolean; error?: string } => {
  const presentation = parseLocalDate(presentationDate);
  const expiration = parseLocalDate(expirationDate);

  if (isNaN(presentation.getTime()) || isNaN(expiration.getTime())) {
    return { valid: false, error: 'Fechas inválidas' };
  }

  if (expiration <= presentation) {
    return { valid: false, error: 'La fecha de vencimiento debe ser posterior a la de presentación' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiration < today) {
    return { valid: false, error: 'La fecha de vencimiento no puede estar en el pasado' };
  }

  return { valid: true };
};

/**
 * Valida que un servicio esté dentro de la ventana de notificación
 */
export const validateServiceWithinNotificationWindow = (
  expirationDate: string,
  windowDays: number = EXPIRATION_CONFIG.NOTIFICATION_WINDOW_DAYS
): boolean => {
  const daysUntil = calculateDaysUntilExpiration(expirationDate);
  return daysUntil > 0 && daysUntil <= windowDays;
};

/**
 * Valida que una fecha sea válida y parseable
 */
export const isValidDate = (dateString: string): boolean => {
  const date = parseLocalDate(dateString);
  return !isNaN(date.getTime());
};
