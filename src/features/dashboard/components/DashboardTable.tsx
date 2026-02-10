import React from 'react';
import { ExpirationStatus } from '../../../types/expirable';
import { ChevronRight } from 'lucide-react';

export interface DashboardItem {
    id: string;
    name: string;
    type: string;
    expirationDate: string;
    status: ExpirationStatus;
    modulePath: string;
}

interface DashboardTableProps {
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

export const DashboardTable: React.FC<DashboardTableProps> = ({ items, onItemClick }) => {
    return (
        <div className="flex-1 overflow-x-auto hidden sm:block">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="text-xs font-medium text-gray-400 tracking-wide px-4 sm:px-5 py-2.5">Nombre</th>
                        <th className="text-xs font-medium text-gray-400 tracking-wide px-4 sm:px-5 py-2.5 hidden md:table-cell">Tipo</th>
                        <th className="text-xs font-medium text-gray-400 tracking-wide px-4 sm:px-5 py-2.5">Vencimiento</th>
                        <th className="text-xs font-medium text-gray-400 tracking-wide px-4 sm:px-5 py-2.5">Estado</th>
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-600">
                    {items.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                        >
                            <td className="font-medium text-gray-900 px-4 sm:px-5 py-2.5">{item.name}</td>
                            <td className="px-4 sm:px-5 py-2.5 hidden md:table-cell">{item.type}</td>
                            <td className="px-4 sm:px-5 py-2.5 tabular-nums">
                                {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}
                            </td>
                            <td className="px-4 sm:px-5 py-2.5">{getStatusBadge(item.status)}</td>
                            <td className="pr-3">
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
