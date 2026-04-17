import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatDateLocal } from '../../../lib/utils/dateUtils';
import type { DashboardItem } from '../types';

export type { DashboardItem };

interface DashboardTableProps {
  items: DashboardItem[];
  onItemClick: (item: DashboardItem) => void;
}

export const DashboardTable = ({ items, onItemClick }: DashboardTableProps) => {
  return (
    <div className="hidden sm:flex flex-col w-full h-full border border-border rounded-lg bg-background overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-left">
              Documento
            </th>
            <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-left w-36">
              Tipo
            </th>
            <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-left w-[120px]">
              Estado
            </th>
            <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-left w-[120px]">
              Vencimiento
            </th>
            <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-right w-[96px]">
              Accion
            </th>
          </tr>
        </thead>
      </table>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <table className="w-full">
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="text-sm text-foreground py-3.5 px-4 truncate">{item.name}</td>
                <td className="text-sm text-muted-foreground py-3.5 px-4 w-36 truncate">
                  {item.type}
                </td>
                <td className="py-3.5 px-4 w-[120px]">
                  <StatusBadge status={item.status} />
                </td>
                <td className="text-sm text-muted-foreground py-3.5 px-4 w-[120px]">
                  {formatDateLocal(item.expirationDate)}
                </td>
                <td className="py-3.5 px-4 w-[96px] text-right">
                  <Button type="button" variant="ghost" onClick={() => onItemClick(item)}>
                    Ver
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
