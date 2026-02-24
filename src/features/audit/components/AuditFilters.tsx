import { Select } from '@/components/common/Select';
import { DatePicker } from '@/components/common/DatePicker';
import type { AuditFilters as AuditFiltersType, AuditAction, AuditTableName } from '../../../types/audit';
import { AUDIT_ACTION_LABELS, AUDIT_TABLE_LABELS } from '../../../types/audit';

interface AuditFiltersProps {
  filters: AuditFiltersType;
  onFiltersChange: (filters: AuditFiltersType) => void;
  onClearFilters: () => void;
}

export const AuditFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: AuditFiltersProps) => {
  const handleFilterChange = (key: keyof AuditFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Acción
          </label>
          <Select
            value={filters.action || ''}
            onChange={(e) =>
              handleFilterChange('action', e.target.value as AuditAction)
            }
          >
            <option value="">Todas las acciones</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tabla
          </label>
          <Select
            value={filters.tableName || ''}
            onChange={(e) =>
              handleFilterChange('tableName', e.target.value as AuditTableName)
            }
          >
            <option value="">Todas las tablas</option>
            {Object.entries(AUDIT_TABLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <DatePicker
          label="Fecha desde"
          value={filters.dateFrom || ''}
          onChange={(value) => handleFilterChange('dateFrom', value)}
        />

        <DatePicker
          label="Fecha hasta"
          value={filters.dateTo || ''}
          onChange={(value) => handleFilterChange('dateTo', value)}
        />
      </div>
    </div>
  );
};
