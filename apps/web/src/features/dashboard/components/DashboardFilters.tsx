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
            className="absolute top-full left-0 z-10 mt-1 min-w-[200px] rounded-md bg-background border border-border py-1 shadow-md"
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
        <div className="flex items-center flex-wrap gap-3">
            {/* Search */}
            <div className="flex items-center w-64 h-9 px-3 gap-2 rounded-md border border-input bg-background flex-shrink-0">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 min-w-0 text-sm text-foreground bg-transparent border-none focus:outline-none placeholder:text-muted-foreground"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="focus:outline-none"
                    >
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
            </div>

            {/* Sort */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => { setShowSortDropdown(!showSortDropdown); setShowStatusDropdown(false); setShowTypeDropdown(false); }}
                    className="flex items-center h-9 px-4 gap-2 rounded-md text-sm font-medium text-foreground bg-transparent hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    <span>Ordenar</span>
                </button>
                <DropdownMenu isOpen={showSortDropdown} onClose={() => setShowSortDropdown(false)}>
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => { onSortChange(option.value); setShowSortDropdown(false); }}
                            className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted focus:outline-none ${
                                sortBy === option.value
                                    ? 'font-medium text-foreground bg-muted'
                                    : 'text-muted-foreground'
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
                    className={`flex items-center h-9 px-4 gap-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                        filterStatus
                            ? 'bg-muted text-foreground'
                            : 'bg-transparent text-foreground hover:bg-muted'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                    <span>
                        {filterStatus ? statusOptions.find(o => o.value === filterStatus)?.label : 'Estado'}
                    </span>
                </button>
                <DropdownMenu isOpen={showStatusDropdown} onClose={() => setShowStatusDropdown(false)}>
                    {statusOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => { onStatusChange(option.value || undefined); setShowStatusDropdown(false); }}
                            className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted focus:outline-none ${
                                filterStatus === option.value
                                    ? 'font-medium text-foreground bg-muted'
                                    : 'text-muted-foreground'
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
                        className={`flex items-center h-9 px-4 gap-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                            filterType
                                ? 'bg-muted text-foreground'
                                : 'bg-transparent text-foreground hover:bg-muted'
                        }`}
                    >
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        <span>
                            {filterType || 'Tipo'}
                        </span>
                    </button>
                    <DropdownMenu isOpen={showTypeDropdown} onClose={() => setShowTypeDropdown(false)}>
                        <button
                            onClick={() => { onTypeChange(undefined); setShowTypeDropdown(false); }}
                            className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted focus:outline-none ${
                                !filterType
                                    ? 'font-medium text-foreground bg-muted'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            Todos los tipos
                        </button>
                        {typeOptions.map(type => (
                            <button
                                key={type}
                                onClick={() => { onTypeChange(type); setShowTypeDropdown(false); }}
                                className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted focus:outline-none ${
                                    filterType === type
                                        ? 'font-medium text-foreground bg-muted'
                                        : 'text-muted-foreground'
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
                    className="flex items-center h-9 px-2 rounded-md hover:bg-muted transition-colors focus:outline-none"
                    title="Limpiar filtros"
                >
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            )}
        </div>
    );
};
