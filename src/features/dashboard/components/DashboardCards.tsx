import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ExpirationStatus } from '../../../types/expirable';
import { DashboardItem } from './DashboardTable';

interface DashboardCardsProps {
    items: DashboardItem[];
    onItemClick: (item: DashboardItem) => void;
}

const getStatusBadge = (status: ExpirationStatus) => {
    const config = {
        valid: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200/50', label: 'Vigente' },
        expiring: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200/50', label: 'Por vencer' },
        expired: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200/50', label: 'Vencido' },
    }[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
            <CheckCircle className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
};

export const DashboardCards: React.FC<DashboardCardsProps> = ({ items, onItemClick }) => {
    return (
        <div className="flex-1 overflow-y-auto sm:hidden">
            <div className="divide-y divide-gray-100">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className="p-4 hover:bg-gray-50/50 transition-colors cursor-pointer active:bg-gray-100"
                    >
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                            {getStatusBadge(item.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{item.type}</span>
                            <span>Vence: {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
