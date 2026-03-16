import { ChevronRight } from 'lucide-react';
import { DashboardItem } from './DashboardTable';
import { StatusBadge } from '../../../components/common/StatusBadge';

interface DashboardCardsProps {
    items: DashboardItem[];
    onItemClick: (item: DashboardItem) => void;
}

export const DashboardCards = ({ items, onItemClick }: DashboardCardsProps) => {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar sm:hidden bg-background rounded-md border border-border">
            <div className="divide-y divide-border">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className="flex items-center cursor-pointer gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-sm font-medium text-foreground truncate">
                                    {item.name}
                                </span>
                                <StatusBadge status={item.status} />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground truncate">
                                    {item.type}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
};
