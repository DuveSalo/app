/**
 * Expiration Thresholds Configuration
 * Constantes centralizadas para umbrales de vencimiento
 */

export const EXPIRATION_CONFIG = {
  /**
   * Ventana de días para notificaciones de vencimiento
   * Servicios que vencen dentro de este período recibirán notificación
   */
  NOTIFICATION_WINDOW_DAYS: 31,

  /**
   * Umbral de días para considerar una situación urgente
   * Servicios con menos días restantes se marcan como críticos
   */
  URGENCY_THRESHOLD_DAYS: 10,

  /**
   * Umbral de días para mostrar estado "expiring" en el frontend
   */
  EXPIRING_THRESHOLD_DAYS: 31,

  /**
   * Años de validez para códigos QR
   */
  QR_VALIDITY_YEARS: 1,
} as const;

/**
 * Configuración de formato de fechas
 */
export const DATE_FORMAT = {
  LOCALE: 'es-AR',
  OPTIONS: {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  },
} as const;
