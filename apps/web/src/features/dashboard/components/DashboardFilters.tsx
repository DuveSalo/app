import { useRef, useEffect, type ReactNode, useState } from 'react';
import { Search, ArrowUpDown, SlidersHorizontal, Layers, X } from 'lucide-react';

interface SortOption {
    value: string;
    label: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface DashboardFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    filterStatus: string | undefined;
    onStatusChange: (value: string | undefined) => void;
    filterType: string | undefined;
    onTypeChange: (value: string | undefined) => void;
    typeOptions: string[];
    sortOptions: SortOption[];
    statusOptions: StatusOption[];
}

interface DropdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const DropdownMenu = ({ isOpen, onClose, children }: DropdownMenuProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={ref}
            className="absolute top-full left-0 z-10 mt-1 min-w-[200px] rounded-md border border-neutral-200 bg-white py-1 animate-fade-in"
        >
            {children}
        </div>
    );
};

export const DashboardFilters = ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    filterStatus,
    onStatusChange,
    filterType,
    onTypeChange,
    typeOptions,
    sortOptions,
    statusOptions,
}: DashboardFiltersProps) => {
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const hasActiveFilters = !!filterStatus || !!filterType;

    return (
        <div className="flex items-center gap-2.5 w-full">
            {/* Search */}
            <div className="flex items-center w-[280px] h-[38px] px-3.5 gap-2.5 shrink-0 rounded-md border border-neutral-200">
                <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-sm font-light text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="focus:outline-none"
                    >
                        <X className="h-3.5 w-3.5 text-neutral-400" />
                    </button>
                )}
            </div>

            {/* Sort */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => { setShowSortDropdown(!showSortDropdown); setShowStatusDropdown(false); setShowTypeDropdown(false); }}
                    className="flex items-center h-[38px] px-3.5 gap-2 rounded-md border border-neutral-200 focus:outline-none"
                >
                    <ArrowUpDown className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-900">Ordenar</span>
                </button>
                <DropdownMenu isOpen={showSortDropdown} onClose={() => setShowSortDropdown(false)}>
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => { onSortChange(option.value); setShowSortDropdown(false); }}
                            className={`w-full text-left px-3.5 py-2 text-sm focus:outline-none transition-colors hover:bg-neutral-50 ${
                                sortBy === option.value
                                    ? 'font-medium text-neutral-900 bg-neutral-50'
                                    : 'font-light text-neutral-500'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </DropdownMenu>
            </div>

            {/* Status */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowSortDropdown(false); setShowTypeDropdown(false); }}
                    className={`flex items-center h-[38px] px-3.5 gap-2 rounded-md border focus:outline-none ${
                        filterStatus ? 'border-neutral-900 border-2' : 'border-neutral-200'
                    }`}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-900">
                        {filterStatus ? statusOptions.find(o => o.value === filterStatus)?.label : 'Estado'}
                    </span>
                </button>
                <DropdownMenu isOpen={showStatusDropdown} onClose={() => setShowStatusDropdown(false)}>
                    {statusOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => { onStatusChange(option.value || undefined); setShowStatusDropdown(false); }}
                            className={`w-full text-left px-3.5 py-2 text-sm focus:outline-none transition-colors hover:bg-neutral-50 ${
                                filterStatus === option.value
                                    ? 'font-medium text-neutral-900 bg-neutral-50'
                                    : 'font-light text-neutral-500'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </DropdownMenu>
            </div>

            {/* Type */}
            {typeOptions.length > 0 && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowSortDropdown(false); setShowStatusDropdown(false); }}
                        className={`flex items-center h-[38px] px-3.5 gap-2 rounded-md border focus:outline-none ${
                            filterType ? 'border-neutral-900 border-2' : 'border-neutral-200'
                        }`}
                    >
                        <Layers className="h-3.5 w-3.5 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-900">
                            {filterType || 'Tipo'}
                        </span>
                    </button>
                    <DropdownMenu isOpen={showTypeDropdown} onClose={() => setShowTypeDropdown(false)}>
                        <button
                            onClick={() => { onTypeChange(undefined); setShowTypeDropdown(false); }}
                            className={`w-full text-left px-3.5 py-2 text-sm focus:outline-none transition-colors hover:bg-neutral-50 ${
                                !filterType
                                    ? 'font-medium text-neutral-900 bg-neutral-50'
                                    : 'font-light text-neutral-500'
                            }`}
                        >
                            Todos los tipos
                        </button>
                        {typeOptions.map(type => (
                            <button
                                key={type}
                                onClick={() => { onTypeChange(type); setShowTypeDropdown(false); }}
                                className={`w-full text-left px-3.5 py-2 text-sm focus:outline-none transition-colors hover:bg-neutral-50 ${
                                    filterType === type
                                        ? 'font-medium text-neutral-900 bg-neutral-50'
                                        : 'font-light text-neutral-500'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </DropdownMenu>
                </div>
            )}

            {/* Clear filters */}
            {hasActiveFilters && (
                <button
                    onClick={() => { onStatusChange(undefined); onTypeChange(undefined); }}
                    className="focus:outline-none"
                    title="Limpiar filtros"
                >
                    <X className="h-3.5 w-3.5 text-neutral-400" />
                </button>
            )}
        </div>
    );
};
