/**
 * Notifications Service
 * Handles in-app notification CRUD operations
 */

import { supabase } from '../../supabase/client';
import { Notification, NotificationFilters, NotificationStats, PaginatedNotifications } from '../../../types/notification';
import { handleSupabaseError } from '../../utils/errors';
import { Tables } from '../../../types/database.types';

type NotificationRow = Tables<'notifications'>;

/**
 * Maps database row to Notification type
 */
const mapNotificationFromDb = (row: NotificationRow): Notification => ({
  id: row.id,
  companyId: row.company_id,
  userId: row.user_id ?? undefined,
  type: row.type as Notification['type'],
  category: row.category as Notification['category'],
  title: row.title,
  message: row.message,
  link: row.link ?? undefined,
  relatedTable: row.related_table ?? undefined,
  relatedId: row.related_id ?? undefined,
  isRead: row.is_read,
  readAt: row.read_at ?? undefined,
  createdAt: row.created_at,
});

/**
 * Get notifications for a company with optional filters.
 * Returns paginated response with metadata.
 */
export const getNotifications = async (
  companyId: string,
  filters: NotificationFilters = {}
): Promise<PaginatedNotifications> => {
  const page = filters.offset && filters.limit ? Math.floor(filters.offset / filters.limit) + 1 : 1;
  const pageSize = filters.limit || 50;

  // Count query with same filters (use 'id' instead of '*' for efficiency)
  let countQuery = supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (filters.isRead !== undefined) {
    countQuery = countQuery.eq('is_read', filters.isRead);
  }
  if (filters.type) {
    countQuery = countQuery.eq('type', filters.type);
  }
  if (filters.category) {
    countQuery = countQuery.eq('category', filters.category);
  }

  const columns = '*';

  // Data query
  let dataQuery = supabase
    .from('notifications')
    .select(columns)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (filters.isRead !== undefined) {
    dataQuery = dataQuery.eq('is_read', filters.isRead);
  }
  if (filters.type) {
    dataQuery = dataQuery.eq('type', filters.type);
  }
  if (filters.category) {
    dataQuery = dataQuery.eq('category', filters.category);
  }

  const offset = (page - 1) * pageSize;
  dataQuery = dataQuery.range(offset, offset + pageSize - 1);

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  if (countResult.error) handleSupabaseError(countResult.error);
  if (dataResult.error) handleSupabaseError(dataResult.error);

  const total = countResult.count || 0;

  return {
    items: (dataResult.data || []).map(mapNotificationFromDb),
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize),
  };
};

/**
 * Get unread notification count for a company
 */
export const getUnreadCount = async (companyId: string): Promise<number> => {
  // Use 'id' instead of '*' for count efficiency
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('is_read', false);

  if (error) {
    handleSupabaseError(error);
  }

  return count || 0;
};

/**
 * Get notification stats (total and unread count)
 */
export const getNotificationStats = async (companyId: string): Promise<NotificationStats> => {
  // Use 'id' instead of '*' for count efficiency
  const [totalResult, unreadResult] = await Promise.all([
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_read', false),
  ]);

  if (totalResult.error) handleSupabaseError(totalResult.error);
  if (unreadResult.error) handleSupabaseError(unreadResult.error);

  return {
    total: totalResult.count || 0,
    unread: unreadResult.count || 0,
  };
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) {
    handleSupabaseError(error);
  }
};

/**
 * Mark all notifications as read for a company
 */
export const markAllAsRead = async (companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('company_id', companyId)
    .eq('is_read', false);

  if (error) {
    handleSupabaseError(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    handleSupabaseError(error);
  }
};

/**
 * Delete all read notifications for a company
 */
export const deleteReadNotifications = async (companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('company_id', companyId)
    .eq('is_read', true);

  if (error) {
    handleSupabaseError(error);
  }
};
