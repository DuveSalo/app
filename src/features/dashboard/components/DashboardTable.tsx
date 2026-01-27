import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ExpirationStatus } from '../../../types/expirable';

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

export const DashboardTable: React.FC<DashboardTableProps> = ({ items, onItemClick }) => {
    return (
        <div className="flex-1 overflow-x-auto hidden sm:block">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="uppercase text-xs font-medium text-gray-400 tracking-wider px-4 sm:px-6 py-3 sm:py-4">Nombre</th>
                        <th className="uppercase text-xs font-medium text-gray-400 tracking-wider px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Tipo</th>
                        <th className="uppercase text-xs font-medium text-gray-400 tracking-wider px-4 sm:px-6 py-3 sm:py-4">Vencimiento</th>
                        <th className="uppercase text-xs font-medium text-gray-400 tracking-wider px-4 sm:px-6 py-3 sm:py-4">Estado</th>
                    </tr>
                </thead>
                <tbody className="text-sm sm:text-base text-gray-700">
                    {items.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        >
                            <td className="font-medium text-gray-900 px-4 sm:px-6 py-3 sm:py-4">{item.name}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 hidden md:table-cell">{item.type}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600">
                                {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">{getStatusBadge(item.status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
