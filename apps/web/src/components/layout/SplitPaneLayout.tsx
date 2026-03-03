import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ─── Types ───────────────────────────────────────────────────── */

export interface SplitPaneItem {
    id: string;
}

interface SplitPaneLayoutProps<T extends SplitPaneItem> {
    items: T[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    renderListItem: (item: T, isSelected: boolean) => ReactNode;
    renderDetail: (item: T) => ReactNode;
    emptyDetailMessage?: string;
    listLabel?: string;
    totalCount?: number;
}

/* ─── Component ───────────────────────────────────────────────── */

export function SplitPaneLayout<T extends SplitPaneItem>({
    items,
    selectedId,
    onSelect,
    renderListItem,
    renderDetail,
    emptyDetailMessage = 'Seleccione un elemento para ver los detalles.',
    listLabel = 'Elementos',
    totalCount,
}: Readonly<SplitPaneLayoutProps<T>>) {
    const selectedItem = items.find((i) => i.id === selectedId) ?? null;
    const count = totalCount ?? items.length;

    return (
        <div className="flex flex-1 bg-white rounded-lg border border-neutral-200 overflow-hidden min-h-0 h-full">
            {/* ── Left Panel (Master List) ── */}
            <aside className="w-1/3 min-w-[240px] max-w-[360px] border-r border-neutral-200 flex flex-col bg-neutral-50/50">
                {/* Header */}
                <div className="px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs font-medium text-neutral-500">
                        {listLabel}
                    </span>
                    <span className="text-xs text-neutral-400">
                        {count}
                    </span>
                </div>

                {/* Scrollable list */}
                <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                    {items.map((item) => {
                        const isSelected = item.id === selectedId;
                        return (
                            <div
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={cn(
                                    'group flex items-center gap-3 px-4 py-3 border-b border-neutral-100 cursor-pointer transition-colors border-l-2',
                                    isSelected
                                        ? 'bg-white border-l-neutral-900'
                                        : 'hover:bg-white/80 border-l-transparent'
                                )}
                            >
                                {renderListItem(item, isSelected)}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* ── Right Panel (Detail View) ── */}
            <section className="flex-1 flex flex-col p-6 bg-white overflow-y-auto custom-scrollbar min-h-0">
                {selectedItem ? (
                    renderDetail(selectedItem)
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs text-neutral-500">{emptyDetailMessage}</p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default SplitPaneLayout;
