import { useState } from 'react';
import { AuditLogItem } from './AuditLogItem';
import type { AuditLog } from '../../../types/audit';

interface AuditLogListProps {
  logs: AuditLog[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const AuditLogList = ({
  logs,
  isLoading = false,
  emptyMessage = 'No hay registros de auditoria disponibles',
}: AuditLogListProps) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleDetails = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-neutral-200 rounded-md p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
              <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-md p-8 text-center">
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <AuditLogItem
          key={log.id}
          log={log}
          showDetails={expandedLogId === log.id}
          onToggleDetails={() => toggleDetails(log.id)}
        />
      ))}
    </div>
  );
};
