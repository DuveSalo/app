import { ExpirationStatus } from '../../../types/expirable';
import { ChevronRight, CircleCheck, Clock4, CircleX } from 'lucide-react';

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

export const DashboardTable = ({ items, onItemClick }: DashboardTableProps) => {
    return (
        <div className="hidden sm:flex flex-col w-full rounded-md border border-neutral-200">
            {/* Header */}
            <div className="flex items-stretch h-11 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-center flex-1 px-5">
                    <span className="text-xs font-medium text-neutral-500">Documento</span>
                </div>
                <div className="flex items-center w-40 px-4">
                    <span className="text-xs font-medium text-neutral-500">Tipo</span>
                </div>
                <div className="flex items-center w-[140px] px-4">
                    <span className="text-xs font-medium text-neutral-500">Estado</span>
                </div>
                <div className="flex items-center w-[140px] px-4">
                    <span className="text-xs font-medium text-neutral-500">Vencimiento</span>
                </div>
                <div className="w-12" />
            </div>

            {/* Rows */}
            {items.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className="flex items-stretch h-[52px] cursor-pointer border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors"
                >
                    <div className="flex items-center flex-1 px-5">
                        <span className="text-sm font-light text-neutral-900">
                            {item.name}
                        </span>
                    </div>
                    <div className="flex items-center w-40 px-4">
                        <span className="text-sm font-light text-neutral-500">
                            {item.type}
                        </span>
                    </div>
                    <div className="flex items-center w-[140px] px-4">
                        <StatusBadge status={item.status} />
                    </div>
                    <div className="flex items-center w-[140px] px-4">
                        <span className="text-sm font-light text-neutral-500">
                            {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}
                        </span>
                    </div>
                    <div className="flex items-center justify-center w-12">
                        <ChevronRight className="h-4 w-4 text-neutral-300" />
                    </div>
                </div>
            ))}
        </div>
    );
};
