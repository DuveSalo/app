/**
 * Expiration Thresholds Configuration
 * Constantes centralizadas para umbrales de vencimiento y notificaciones
 */

export const EXPIRATION_CONFIG = {
  /**
   * Ventana de días para enviar notificaciones de vencimiento
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
 * Estilos y configuración para emails
 */
export const EMAIL_STYLES = {
  COLORS: {
    /**
     * Color para headers y elementos primarios (#1e40af - Blue 900)
     */
    HEADER: '#1e40af',

    /**
     * Color para botones y acciones principales (#1e40af - Blue 900)
     */
    PRIMARY: '#1e40af',

    /**
     * Color para alertas urgentes (#DC2626 - Red 600)
     */
    URGENT: '#DC2626',

    /**
     * Color para advertencias (#F59E0B - Amber 500)
     */
    WARNING: '#F59E0B',

    /**
     * Color de fondo principal
     */
    BACKGROUND: '#f3f4f6',

    /**
     * Color de fondo de tarjetas
     */
    CARD_BACKGROUND: '#f9fafb',

    /**
     * Color de texto principal
     */
    TEXT_PRIMARY: '#374151',

    /**
     * Color de texto secundario
     */
    TEXT_SECONDARY: '#6b7280',

    /**
     * Color de texto muted
     */
    TEXT_MUTED: '#9ca3af',

    /**
     * Color de texto oscuro
     */
    TEXT_DARK: '#111827',

    /**
     * Color de bordes
     */
    BORDER: '#e5e7eb',

    /**
     * Color blanco
     */
    WHITE: '#ffffff',
  },

  PADDING: {
    HEADER: '30px 40px',
    CONTENT: '40px',
    ALERT: '15px 40px',
    FOOTER: '30px 40px',
    CARD: '20px',
  },

  FONT_SIZE: {
    TITLE: '24px',
    SUBTITLE: '18px',
    BODY: '16px',
    SMALL: '14px',
    TINY: '12px',
  },
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
