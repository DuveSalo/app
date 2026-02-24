import { ChevronRight } from 'lucide-react';
import { ExpirationStatus } from '../../../types/expirable';
import { DashboardItem } from './DashboardTable';

interface DashboardCardsProps {
    items: DashboardItem[];
    onItemClick: (item: DashboardItem) => void;
}

const STATUS_CONFIG = {
    valid: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Vigente' },
    expiring: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Por vencer' },
    expired: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'Vencido' },
};

const getStatusBadge = (status: ExpirationStatus) => {
    const config = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

export const DashboardCards = ({ items, onItemClick }: DashboardCardsProps) => {
    return (
        <div className="flex-1 overflow-y-auto sm:hidden">
            <div className="divide-y divide-gray-100">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className="px-4 py-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer active:bg-gray-100 flex items-center gap-3"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-medium text-gray-900 text-sm truncate">{item.name}</span>
                                {getStatusBadge(item.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="truncate">{item.type}</span>
                                <span className="text-gray-300">|</span>
                                <span className="tabular-nums whitespace-nowrap">Vence: {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
};
