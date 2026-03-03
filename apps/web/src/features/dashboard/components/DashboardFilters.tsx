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
            className="absolute top-full left-0 z-10 mt-1 min-w-[200px] rounded-md bg-white border border-neutral-200 py-1 shadow-md animate-dropdown-in"
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
        <div className="flex items-center flex-wrap gap-2">
            {/* Search */}
            <div className="flex items-center w-[260px] h-8 px-3 gap-2 rounded-md border border-neutral-200 flex-shrink-0 bg-white">
                <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 min-w-0 text-sm text-neutral-900 bg-transparent border-none focus:outline-none placeholder:text-neutral-400"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="focus:outline-none"
                    >
                        <X className="w-3 h-3 text-neutral-400 hover:text-neutral-600" />
                    </button>
                )}
            </div>

            {/* Sort */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => { setShowSortDropdown(!showSortDropdown); setShowStatusDropdown(false); setShowTypeDropdown(false); }}
                    className="flex items-center h-8 px-3 gap-1.5 rounded-md border border-neutral-200 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none"
                >
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Ordenar</span>
                </button>
                <DropdownMenu isOpen={showSortDropdown} onClose={() => setShowSortDropdown(false)}>
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => { onSortChange(option.value); setShowSortDropdown(false); }}
                            className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 focus:outline-none ${
                                sortBy === option.value
                                    ? 'font-medium text-neutral-900 bg-neutral-50'
                                    : 'text-neutral-500'
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
                    className={`flex items-center h-8 px-3 gap-1.5 rounded-md text-sm font-medium bg-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none border ${
                        filterStatus
                            ? 'border-neutral-900 text-neutral-900'
                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                    <span>
                        {filterStatus ? statusOptions.find(o => o.value === filterStatus)?.label : 'Estado'}
                    </span>
                </button>
                <DropdownMenu isOpen={showStatusDropdown} onClose={() => setShowStatusDropdown(false)}>
                    {statusOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => { onStatusChange(option.value || undefined); setShowStatusDropdown(false); }}
                            className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 focus:outline-none ${
                                filterStatus === option.value
                                    ? 'font-medium text-neutral-900 bg-neutral-50'
                                    : 'text-neutral-500'
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
                        className={`flex items-center h-8 px-3 gap-1.5 rounded-md text-sm font-medium bg-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none border ${
                            filterType
                                ? 'border-neutral-900 text-neutral-900'
                                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5 text-neutral-500" />
                        <span>
                            {filterType || 'Tipo'}
                        </span>
                    </button>
                    <DropdownMenu isOpen={showTypeDropdown} onClose={() => setShowTypeDropdown(false)}>
                        <button
                            onClick={() => { onTypeChange(undefined); setShowTypeDropdown(false); }}
                            className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 focus:outline-none ${
                                !filterType
                                    ? 'font-medium text-neutral-900 bg-neutral-50'
                                    : 'text-neutral-500'
                            }`}
                        >
                            Todos los tipos
                        </button>
                        {typeOptions.map(type => (
                            <button
                                key={type}
                                onClick={() => { onTypeChange(type); setShowTypeDropdown(false); }}
                                className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 focus:outline-none ${
                                    filterType === type
                                        ? 'font-medium text-neutral-900 bg-neutral-50'
                                        : 'text-neutral-500'
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
                    <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600" />
                </button>
            )}
        </div>
    );
};
