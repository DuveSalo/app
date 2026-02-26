import { Clock, User, Database } from 'lucide-react';
import type { AuditLog } from '../../../types/audit';
import { AUDIT_ACTION_LABELS, AUDIT_TABLE_LABELS } from '../../../types/audit';
import { calculateChanges, formatAuditValue, getFieldLabel } from '../../../lib/api/auditApi';

interface AuditLogItemProps {
  log: AuditLog;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

export const AuditLogItem = ({
  log,
  showDetails = false,
  onToggleDetails,
}: AuditLogItemProps) => {
  const changes = calculateChanges(log.oldData, log.newData);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'UPDATE':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DELETE':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-neutral-600 bg-neutral-100 border-neutral-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-md p-4 hover:bg-neutral-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-md border ${getActionColor(
                log.action
              )}`}
            >
              {AUDIT_ACTION_LABELS[log.action]}
            </span>
            <span className="text-sm text-neutral-600">
              {AUDIT_TABLE_LABELS[log.tableName]}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-500 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-5 h-5" />
              <span>{formatDate(log.createdAt)}</span>
            </div>
            {log.userId && (
              <div className="flex items-center gap-1">
                <User className="w-5 h-5" />
                <span>Usuario: {log.userId.substring(0, 8)}...</span>
              </div>
            )}
          </div>

          {changes.length > 0 && (
            <div className="text-sm text-neutral-600">
              {changes.length} campo{changes.length !== 1 ? 's' : ''} modificado
              {changes.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {changes.length > 0 && (
          <button
            onClick={onToggleDetails}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
        )}
      </div>

      {showDetails && changes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-900 mb-3">
            Cambios realizados:
          </h4>
          <div className="space-y-3">
            {changes.map((change, index) => (
              <div
                key={index}
                className="bg-neutral-100 rounded-md p-3 border border-neutral-200"
              >
                <div className="text-sm font-medium text-neutral-900 mb-2">
                  {getFieldLabel(change.field)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-500 block mb-1">Antes:</span>
                    <div className="bg-white p-2 rounded-md border border-neutral-200 text-neutral-900 break-words">
                      {formatAuditValue(change.oldValue)}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">Ahora:</span>
                    <div className="bg-white p-2 rounded-md border border-emerald-200 text-neutral-900 break-words">
                      {formatAuditValue(change.newValue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDetails && log.action === 'INSERT' && log.newData && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-900 mb-3">
            Registro creado con:
          </h4>
          <div className="bg-neutral-100 rounded-md p-3 border border-neutral-200">
            <pre className="text-xs text-neutral-900 whitespace-pre-wrap">
              {JSON.stringify(log.newData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {showDetails && log.action === 'DELETE' && log.oldData && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-900 mb-3">
            Registro eliminado:
          </h4>
          <div className="bg-neutral-100 rounded-md p-3 border border-neutral-200">
            <pre className="text-xs text-neutral-900 whitespace-pre-wrap">
              {JSON.stringify(log.oldData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
