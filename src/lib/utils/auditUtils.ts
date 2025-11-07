
import type { AuditChange } from '../../types/audit';

/**
 * Calculates the changes between old and new data for an audit log.
 * @param oldData - The old data record.
 * @param newData - The new data record.
 * @returns An array of changes.
 */
export const calculateChanges = (
  oldData: Record<string, any> | null,
  newData: Record<string, any> | null
): AuditChange[] => {
  if (!oldData && !newData) return [];

  const changes: AuditChange[] = [];
  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {}),
  ]);

  allKeys.forEach(key => {
    if (['created_at', 'updated_at', 'id', 'company_id'].includes(key)) {
      return;
    }

    const oldValue = oldData?.[key];
    const newValue = newData?.[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue,
        changed: true,
      });
    }
  });

  return changes;
};

/**
 * Formats an audit value for display.
 * @param value - The value to format.
 * @returns A string representation of the value.
 */
export const formatAuditValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  if (typeof value === 'string' && value.length > 100) {
    return value.substring(0, 100) + '...';
  }
  return String(value);
};

/**
 * Gets a human-readable label for a field name.
 * @param field - The field name.
 * @returns A human-readable label.
 */
export const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    name: 'Nombre',
    cuit: 'CUIT',
    address: 'Dirección',
    city: 'Ciudad',
    province: 'Provincia',
    postal_code: 'Código Postal',
    phone: 'Teléfono',
    email: 'Email',
    presentation_date: 'Fecha de Presentación',
    expiration_date: 'Fecha de Vencimiento',
    intervener: 'Interventor',
    registration_number: 'Número de Registro',
    pdf_file_url: 'Archivo PDF',
    system_name: 'Nombre del Sistema',
    system_type: 'Tipo de Sistema',
    location: 'Ubicación',
    status: 'Estado',
    last_inspection_date: 'Última Inspección',
    next_inspection_date: 'Próxima Inspección',
    responsible_company: 'Empresa Responsable',
    role: 'Rol',
    date: 'Fecha',
    time: 'Hora',
    description: 'Descripción',
    corrective_actions: 'Acciones Correctivas',
    document_name: 'Nombre del Documento',
    type: 'Tipo',
    floor: 'Piso',
    unit: 'Unidad',
    upload_date: 'Fecha de Carga',
  };

  return labels[field] || field;
};
