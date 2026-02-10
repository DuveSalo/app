import React, { useState } from 'react';
import { AuditLogItem } from './AuditLogItem';
import type { AuditLog } from '../../../types/audit';

interface AuditLogListProps {
  logs: AuditLog[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
  logs,
  isLoading = false,
  emptyMessage = 'No hay registros de auditoría disponibles',
}) => {
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
            className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
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
