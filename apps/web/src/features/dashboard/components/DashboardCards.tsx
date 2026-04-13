import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatDateLocal } from '../../../lib/utils/dateUtils';
import { DashboardItem } from './DashboardTable';

interface DashboardCardsProps {
  items: DashboardItem[];
  onItemClick: (item: DashboardItem) => void;
}

export const DashboardCards = ({ items, onItemClick }: DashboardCardsProps) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar sm:hidden bg-background rounded-lg border border-border">
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground truncate">{item.type}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateLocal(item.expirationDate)}
                </span>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => onItemClick(item)}>
              <span className="sr-only">Ver documento</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
