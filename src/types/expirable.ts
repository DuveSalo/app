/**
 * Base types for expirable entities
 * Tipos compartidos para entidades con fechas de vencimiento
 */

/**
 * Base interface para entidades que tienen fecha de vencimiento
 */
export interface Expirable {
  id: string;
  companyId: string;
  expirationDate: string;
}

/**
 * Tipo para servicios próximos a vencer (usado en notificaciones)
 */
export interface ExpiringServiceNotification extends Expirable {
  type: 'certificate' | 'inspection' | 'event';
  name: string;
  daysUntilExpiration: number;
  companyName: string;
  userEmail: string;
}

/**
 * Estado de vencimiento de un servicio
 */
export type ExpirationStatus = 'valid' | 'expiring' | 'expired';

/**
 * Metadata para emails de notificación
 */
export interface EmailNotificationMetadata {
  subject: string;
  html: string;
}

/**
 * Configuración para un tipo de servicio notificable
 */
export interface ServiceNotificationConfig {
  tableName: string;
  dateField: string;
  selectFields: string;
  getServiceLabel: () => string;
  getActionText: () => string;
}
