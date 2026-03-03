import { ExpirationStatus } from '../../../types/expirable';
import { StatusBadge } from '../../../components/common/StatusBadge';
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

export const DashboardTable = ({ items, onItemClick }: DashboardTableProps) => {
    return (
        <div className="hidden sm:flex flex-col w-full h-full border border-neutral-200 rounded-lg bg-white overflow-hidden">
            {/* Header — fixed */}
            <div className="flex items-stretch h-10 bg-neutral-50 border-b border-neutral-200 flex-shrink-0">
                <div className="flex items-center flex-1 px-4">
                    <span className="text-xs font-medium text-neutral-500">Documento</span>
                </div>
                <div className="flex items-center w-36 px-4">
                    <span className="text-xs font-medium text-neutral-500">Tipo</span>
                </div>
                <div className="flex items-center w-[120px] px-4">
                    <span className="text-xs font-medium text-neutral-500">Estado</span>
                </div>
                <div className="flex items-center w-[120px] px-4">
                    <span className="text-xs font-medium text-neutral-500">Vencimiento</span>
                </div>
                <div className="w-10" />
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className="flex items-stretch h-11 cursor-pointer border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/50 transition-colors"
                    >
                        <div className="flex items-center flex-1 px-4">
                            <span className="text-sm text-neutral-900 truncate">
                                {item.name}
                            </span>
                        </div>
                        <div className="flex items-center w-36 px-4">
                            <span className="text-sm text-neutral-500 truncate">
                                {item.type}
                            </span>
                        </div>
                        <div className="flex items-center w-[120px] px-4">
                            <StatusBadge status={item.status} />
                        </div>
                        <div className="flex items-center w-[120px] px-4">
                            <span className="text-sm text-neutral-500">
                                {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}
                            </span>
                        </div>
                        <div className="flex items-center justify-center w-10">
                            <ChevronRight className="h-4 w-4 text-neutral-300" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
