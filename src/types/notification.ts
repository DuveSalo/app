/**
 * Types for in-app notifications
 */

export type NotificationType =
  | 'expiration_warning'   // 30-10 days before expiration
  | 'expiration_urgent'    // Less than 10 days
  | 'expired'              // Already expired
  | 'system'               // System notifications
  | 'info';                // General info

export type NotificationCategory =
  | 'certificate'          // Conservation certificates
  | 'inspection'           // Self-protection systems
  | 'fire_extinguisher'    // Fire extinguishers
  | 'event'                // Events
  | 'qr'                   // QR documents
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
