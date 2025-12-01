
import React from 'react';

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-slate-100 ${className}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={`bg-slate-50/50 ${className}`} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={`bg-white divide-y divide-slate-100 ${className}`} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={`transition-colors ${className}`} {...props} />
);

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th
    scope="col"
    className={`px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide ${className}`}
    {...props}
  />
);

export const TableCell: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={`px-4 py-3.5 text-sm text-slate-700 ${className}`} {...props} />
);
