/**
 * Types for in-app notifications
 */

export type NotificationType =
  | 'expiration_warning'   // 30-10 days before expiration
  | 'expiration_urgent'    // Less than 10 days
  | 'expired'              // Already expired
  | 'success'              // Successful system/admin action
  | 'warning'              // Legacy warning notification
  | 'error'                // Legacy error notification
  | 'system'               // System notifications
  | 'info';                // General info

export type NotificationCategory =
  | 'certificate'          // Conservation certificates
  | 'certificate_expiring' // Legacy certificate expiration category
  | 'inspection'           // Self-protection systems
  | 'system_inspection_due' // Legacy inspection expiration category
  | 'fire_extinguisher'    // Fire extinguishers
  | 'security'             // Legacy fire/security category
  | 'event'                // Events
  | 'qr'                   // QR documents
  | 'payment'              // Bank-transfer payment notifications
  | 'system';              // System notifications

export interface Notification {
  id: string;
  companyId: string;
  userId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;
  relatedTable?: string;
  relatedId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
  category?: NotificationCategory;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}
