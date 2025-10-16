
import React from 'react';

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-borderClr ${className}`} {...props} />
  </div>
);
export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={`bg-surface-subtle ${className}`} {...props} />
);
export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={`bg-surface divide-y divide-borderClr ${className}`} {...props} />
);
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={`${className}`} {...props} />
);
export const TableHead: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium text-content-muted uppercase tracking-wider ${className}`} {...props} />
);
export const TableCell: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={`px-4 py-3 text-sm text-content ${className}`} {...props} />
);
