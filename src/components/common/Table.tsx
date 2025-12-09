
import React from 'react';
import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps } from 'antd';

// Re-export Ant Design Table directly for advanced usage
export { Table as AntTable } from 'antd';
export type { TableProps as AntTableProps, ColumnsType } from 'antd/es/table';

// Simple wrapper components for backward compatibility
export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, children, ...props }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-gray-200 ${className || ''}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={`bg-gray-50/50 ${className || ''}`} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={`bg-white divide-y divide-gray-200 ${className || ''}`} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={`transition-colors duration-150 ${className || ''}`} {...props} />
);

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th
    scope="col"
    className={`px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className || ''}`}
    {...props}
  />
);

export const TableCell: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={`px-4 py-3.5 text-sm text-gray-700 ${className || ''}`} {...props} />
);
