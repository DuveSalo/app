
import { supabase } from '../supabase/client';
import type {
  AuditLog,
  AuditFilters,
  AuditStats,
} from '../../types/audit';
import { Tables } from '../supabase/database.types';

/**
 * Maps audit log data from the database to the application format.
 */
const mapAuditLogFromDb = (data: Tables<'audit_logs'>): AuditLog => {
  return {
    id: data.id,
    userId: data.user_id,
    companyId: data.company_id,
    action: data.action,
    tableName: data.table_name,
    recordId: data.record_id,
    oldData: data.old_data,
    newData: data.new_data,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    createdAt: data.created_at,
  };
};

/**
 * Retrieves audit logs with optional filters.
 */
export const getAuditLogs = async (
  companyId: string,
  filters?: AuditFilters,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> => {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.tableName) {
      query = query.eq('table_name', filters.tableName);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.recordId) {
      query = query.eq('record_id', filters.recordId);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data ? data.map(mapAuditLogFromDb) : [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Retrieves the change history for a specific record.
 */
export const getRecordHistory = async (
  recordId: string,
  tableName: string
): Promise<AuditLog[]> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('record_id', recordId)
      .eq('table_name', tableName)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data ? data.map(mapAuditLogFromDb) : [];
  } catch (error) {
    console.error('Error fetching record history:', error);
    throw error;
  }
};

/**
 * Retrieves audit statistics.
 */
export const getAuditStats = async (
  companyId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<AuditStats> => {
  try {
    let query = supabase
      .from('audit_logs')
      .select('action, user_id, created_at')
      .eq('company_id', companyId);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats: AuditStats = {
      totalLogs: data.length,
      insertCount: data.filter(log => log.action === 'INSERT').length,
      updateCount: data.filter(log => log.action === 'UPDATE').length,
      deleteCount: data.filter(log => log.action === 'DELETE').length,
      uniqueUsers: new Set(data.map(log => log.user_id).filter(Boolean)).size,
      lastActivity: data.length > 0 ? data[0].created_at : null,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    throw error;
  }
};

/**
 * Retrieves recent audit logs for the dashboard.
 */
export const getRecentAuditLogs = async (
  companyId: string,
  limit: number = 10
): Promise<AuditLog[]> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data ? data.map(mapAuditLogFromDb) : [];
  } catch (error) {
    console.error('Error fetching recent audit logs:', error);
    throw error;
  }
};

