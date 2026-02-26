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
 * Estado de vencimiento de un servicio
 */
export type ExpirationStatus = 'valid' | 'expiring' | 'expired';
