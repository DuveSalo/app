/**
 * Date Utilities
 * Funciones centralizadas para manejo de fechas y cálculos de vencimiento
 */

import { EXPIRATION_CONFIG } from '@/constants/expirationThresholds';

/**
 * Calcula los días restantes hasta una fecha de vencimiento
 * @param expirationDate Fecha de vencimiento en formato ISO string
 * @returns Número de días restantes (negativo si ya venció)
 */
export const calculateDaysUntilExpiration = (expirationDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse date as local time to avoid timezone issues
  // If date is in YYYY-MM-DD format, add T00:00:00 to parse as local time
  const dateStr = expirationDate.includes('T') ? expirationDate : `${expirationDate}T00:00:00`;
  const expiry = new Date(dateStr);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Determina el estado de vencimiento de un servicio
 * @param expirationDate Fecha de vencimiento
 * @param thresholdDays Umbral de días para considerar "próximo a vencer" (default: 31)
 * @returns Estado del servicio
 */
export const calculateExpirationStatus = (
  expirationDate: string,
  thresholdDays: number = EXPIRATION_CONFIG.EXPIRING_THRESHOLD_DAYS
): 'valid' | 'expiring' | 'expired' => {
  const daysUntil = calculateDaysUntilExpiration(expirationDate);
  if (daysUntil < 1) return 'expired';
  if (daysUntil <= thresholdDays) return 'expiring';
  return 'valid';
};

/**
 * Formatea una fecha en formato YYYY-MM-DD para mostrar en la UI
 * Evita problemas de timezone parseando la fecha como hora local
 * @param dateString Fecha en formato ISO string (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
 * @param locale Locale para formato (default: 'es-AR')
 * @returns Fecha formateada en formato local (ej: "12/12/2025")
 */
export const formatDateLocal = (dateString: string | null | undefined, locale: string = 'es-AR'): string => {
  if (!dateString) return '-';

  // Parse date as local time to avoid timezone issues
  // If date is in YYYY-MM-DD format, add T00:00:00 to parse as local time
  const dateStr = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  const date = new Date(dateStr);

  return date.toLocaleDateString(locale);
};

/**
 * Formatea una fecha para mostrar en emails
 * @param date Fecha en formato ISO string
 * @param locale Locale para formato (default: 'es-AR')
 * @returns Fecha formateada
 */
export const formatDateForEmail = (date: string, locale: string = 'es-AR'): string => {
  // Parse date as local time to avoid timezone issues
  const dateStr = date.includes('T') ? date : `${date}T00:00:00`;
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calcula el rango de fechas para buscar servicios próximos a vencer
 * @param windowDays Ventana de días a futuro (default: 31)
 * @returns Objeto con fechas desde/hasta
 */
export const getDateRangeForNotifications = (
  windowDays: number = EXPIRATION_CONFIG.NOTIFICATION_WINDOW_DAYS
): { from: Date; to: Date } => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);

  const to = new Date();
  to.setDate(to.getDate() + windowDays);
  to.setHours(23, 59, 59, 999);

  return { from, to };
};

/**
 * Verifica si un servicio está dentro de la ventana de notificación
 * @param expirationDate Fecha de vencimiento
 * @param windowDays Ventana de notificación en días (default: 31)
 * @returns true si el servicio debe ser notificado
 */
export const isWithinNotificationWindow = (
  expirationDate: string,
  windowDays: number = EXPIRATION_CONFIG.NOTIFICATION_WINDOW_DAYS
): boolean => {
  const daysUntil = calculateDaysUntilExpiration(expirationDate);
  return daysUntil > 0 && daysUntil <= windowDays;
};

/**
 * Normaliza una fecha removiendo la hora
 * @param date Fecha a normalizar
 * @returns Nueva fecha con hora en 00:00:00.000
 */
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};
