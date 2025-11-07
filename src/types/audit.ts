// Tipos para el sistema de auditoría

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

export type AuditTableName =
  | 'companies'
  | 'employees'
  | 'conservation_certificates'
  | 'self_protection_systems'
  | 'qr_documents'
  | 'events';

export interface AuditLog {
  id: string;
  userId: string | null;
  companyId: string | null;
  action: AuditAction;
  tableName: AuditTableName;
  recordId: string | null;
  oldData: Record<string, any> | null;
  newData: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogWithUser extends AuditLog {
  userName?: string;
  userEmail?: string;
}

export interface AuditFilters {
  tableName?: AuditTableName;
  action?: AuditAction;
  userId?: string;
  recordId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditStats {
  totalLogs: number;
  insertCount: number;
  updateCount: number;
  deleteCount: number;
  uniqueUsers: number;
  lastActivity: string | null;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changed: boolean;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  INSERT: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
};

export const AUDIT_TABLE_LABELS: Record<AuditTableName, string> = {
  companies: 'Empresas',
  employees: 'Empleados',
  conservation_certificates: 'Certificados de Conservación',
  self_protection_systems: 'Sistemas de Autoprotección',
  qr_documents: 'Documentos QR',
  events: 'Eventos',
};
