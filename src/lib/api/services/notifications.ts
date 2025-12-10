/**
 * Notifications Service
 * Handles in-app notification CRUD operations
 */

import { supabase } from '../../supabase/client';
import { Notification, NotificationFilters, NotificationStats } from '../../../types/notification';
import { handleSupabaseError } from '../../utils/errors';

/**
 * Maps database row to Notification type
 */
const mapNotificationFromDb = (row: any): Notification => ({
  id: row.id,
  companyId: row.company_id,
  userId: row.user_id,
  type: row.type,
  category: row.category,
  title: row.title,
  message: row.message,
  link: row.link,
  relatedTable: row.related_table,
  relatedId: row.related_id,
  isRead: row.is_read,
  readAt: row.read_at,
  createdAt: row.created_at,
});

/**
 * Get notifications for a company with optional filters
 */
export const getNotifications = async (
  companyId: string,
  filters: NotificationFilters = {}
): Promise<Notification[]> => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (filters.isRead !== undefined) {
    query = query.eq('is_read', filters.isRead);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error);
  }

  return (data || []).map(mapNotificationFromDb);
};

/**
 * Get unread notification count for a company
 */
export const getUnreadCount = async (companyId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
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
  const [totalResult, unreadResult] = await Promise.all([
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
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
