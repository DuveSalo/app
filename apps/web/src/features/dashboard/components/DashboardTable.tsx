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
        <div className="hidden sm:flex flex-col w-full h-full border border-border rounded-md bg-background overflow-hidden">
            {/* Header */}
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-left">Documento</th>
                        <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-left w-36">Tipo</th>
                        <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-left w-[120px]">Estado</th>
                        <th className="text-xs font-medium text-muted-foreground py-3 px-4 text-left w-[120px]">Vencimiento</th>
                        <th className="w-10" />
                    </tr>
                </thead>
            </table>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                <table className="w-full">
                    <tbody>
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => onItemClick(item)}
                                className="cursor-pointer border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                            >
                                <td className="text-sm text-foreground py-3.5 px-4 truncate">
                                    {item.name}
                                </td>
                                <td className="text-sm text-muted-foreground py-3.5 px-4 w-36 truncate">
                                    {item.type}
                                </td>
                                <td className="py-3.5 px-4 w-[120px]">
                                    <StatusBadge status={item.status} />
                                </td>
                                <td className="text-sm text-muted-foreground py-3.5 px-4 w-[120px]">
                                    {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}
                                </td>
                                <td className="py-3.5 px-2 w-10 text-center">
                                    <ChevronRight className="h-4 w-4 text-muted-foreground inline-block" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
