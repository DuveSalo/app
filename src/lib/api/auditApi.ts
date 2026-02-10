
import { supabase } from '../supabase/client';
import type {
  AuditLog,
  AuditFilters,
  AuditStats,
} from '../../types/audit';
import { Tables, Json } from '../../types/database.types';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuditAPI');

const AUDIT_LOG_COLUMNS = 'id, company_id, user_id, action, table_name, record_id, old_data, new_data, ip_address, user_agent, created_at' as const;

/**
 * Maps audit log data from the database to the application format.
 */
const mapAuditLogFromDb = (data: Tables<'audit_logs'>): AuditLog => {
  return {
    id: data.id,
    userId: data.user_id || '',
    companyId: data.company_id,
    action: data.action as AuditLog['action'],
    tableName: data.table_name as AuditLog['tableName'],
    recordId: data.record_id || '',
    oldData: data.old_data as Record<string, any> | null,
    newData: data.new_data as Record<string, any> | null,
    ipAddress: typeof data.ip_address === 'string' ? data.ip_address : '',
    userAgent: data.user_agent || '',
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
      .select(AUDIT_LOG_COLUMNS)
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
    logger.error('Error fetching audit logs', error, { companyId, filters });
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
      .select(AUDIT_LOG_COLUMNS)
      .eq('record_id', recordId)
      .eq('table_name', tableName)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data ? data.map(mapAuditLogFromDb) : [];
  } catch (error) {
    logger.error('Error fetching record history', error, { recordId, tableName });
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
    logger.error('Error fetching audit stats', error, { companyId, dateFrom, dateTo });
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
      .select(AUDIT_LOG_COLUMNS)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data ? data.map(mapAuditLogFromDb) : [];
  } catch (error) {
    logger.error('Error fetching recent audit logs', error, { companyId, limit });
    throw error;
  }
};

/**
 * Helper functions for audit log display
 */

type AuditChange = { field: string; oldValue: Json | undefined; newValue: Json | undefined };

export const calculateChanges = (oldData: Record<string, Json | undefined> | null, newData: Record<string, Json | undefined> | null): AuditChange[] => {
  if (!newData) return [];
  if (!oldData) {
    // INSERT - all fields are new
    return Object.keys(newData).map(field => ({
      field,
      oldValue: undefined,
      newValue: newData[field]
    }));
  }

  // UPDATE - find changed fields
  const changes: AuditChange[] = [];
  Object.keys(newData).forEach(field => {
    if (JSON.stringify(oldData[field]) !== JSON.stringify(newData[field])) {
      changes.push({
        field,
        oldValue: oldData[field],
        newValue: newData[field]
      });
    }
  });
  return changes;
};

export const formatAuditValue = (value: Json | undefined): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Format date - parse as local time to avoid timezone issues
    const dateStr = value.includes('T') ? value : `${value}T00:00:00`;
    return new Date(dateStr).toLocaleDateString('es-AR');
  }
  return String(value);
};

export const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    name: 'Nombre',
    email: 'Email',
    address: 'Dirección',
    phone: 'Teléfono',
    presentation_date: 'Fecha de Presentación',
    expiration_date: 'Fecha de Vencimiento',
    intervener: 'Interviniente',
    registration_number: 'Número de Matrícula',
    next_inspection: 'Próxima Inspección',
    status: 'Estado',
    location: 'Ubicación',
    description: 'Descripción',
    module_type: 'Tipo de Módulo',
    date: 'Fecha',
    participants: 'Participantes',
    // Add more field labels as needed
  };
  return labels[field] || field;
};

