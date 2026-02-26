import { ChevronRight, CircleCheck, Clock4, CircleX } from 'lucide-react';
import { ExpirationStatus } from '../../../types/expirable';
import { DashboardItem } from './DashboardTable';

interface DashboardCardsProps {
    items: DashboardItem[];
    onItemClick: (item: DashboardItem) => void;
}

const STATUS_BADGE = {
    valid: {
        label: 'Vigente',
        icon: CircleCheck,
        classes: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        iconClass: 'text-emerald-600',
    },
    expiring: {
        label: 'Por vencer',
        icon: Clock4,
        classes: 'bg-amber-50 border-amber-200 text-amber-700',
        iconClass: 'text-amber-600',
    },
    expired: {
        label: 'Vencido',
        icon: CircleX,
        classes: 'bg-red-50 border-red-200 text-red-700',
        iconClass: 'text-red-600',
    },
};

const StatusBadge = ({ status }: { status: ExpirationStatus }) => {
    const config = STATUS_BADGE[status];
    const Icon = config.icon;
    return (
        <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${config.classes}`}>
            <Icon className={`h-3.5 w-3.5 ${config.iconClass}`} />
            <span className="text-xs font-medium">
                {config.label}
            </span>
        </div>
    );
};

export const DashboardCards = ({ items, onItemClick }: DashboardCardsProps) => {
    return (
        <div className="flex-1 overflow-y-auto sm:hidden">
            <div className="divide-y divide-neutral-200">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className="flex items-center cursor-pointer gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
                    >
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-sm font-medium text-neutral-900 truncate">
                                    {item.name}
                                </span>
                                <StatusBadge status={item.status} />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-500 truncate">
                                    {item.type}
                                </span>
                                <span className="text-xs text-neutral-500">
                                    {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
};
