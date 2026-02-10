import React, { useRef, useEffect } from 'react';
import { Search, ChevronDown, X, ArrowUpDown, Filter, Layers } from 'lucide-react';

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

const DropdownMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
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
        <div ref={ref} className="absolute top-full right-0 sm:min-w-[220px] mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 animate-fade-in">
            {children}
        </div>
    );
};

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
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
}) => {
    const [showSortDropdown, setShowSortDropdown] = React.useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);

    const hasActiveFilters = !!filterStatus || !!filterType;

    return (
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o tipo..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 placeholder-gray-400 text-gray-700 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filters group */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowSortDropdown(!showSortDropdown); setShowStatusDropdown(false); setShowTypeDropdown(false); }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 transition-all whitespace-nowrap"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{sortOptions.find(o => o.value === sortBy)?.label || 'Ordenar'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <DropdownMenu isOpen={showSortDropdown} onClose={() => setShowSortDropdown(false)}>
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => { onSortChange(option.value); setShowSortDropdown(false); }}
                                    className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${sortBy === option.value ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </DropdownMenu>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowSortDropdown(false); setShowTypeDropdown(false); }}
                            className={`px-3 py-2 border rounded-lg text-sm bg-white flex items-center gap-2 transition-all whitespace-nowrap ${
                                filterStatus ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            <Filter className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{filterStatus ? statusOptions.find(o => o.value === filterStatus)?.label : 'Estado'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <DropdownMenu isOpen={showStatusDropdown} onClose={() => setShowStatusDropdown(false)}>
                            {statusOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => { onStatusChange(option.value || undefined); setShowStatusDropdown(false); }}
                                    className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${filterStatus === option.value ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </DropdownMenu>
                    </div>

                    {/* Type Filter */}
                    {typeOptions.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowSortDropdown(false); setShowStatusDropdown(false); }}
                                className={`px-3 py-2 border rounded-lg text-sm bg-white flex items-center gap-2 transition-all whitespace-nowrap ${
                                    filterType ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{filterType || 'Tipo'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            <DropdownMenu isOpen={showTypeDropdown} onClose={() => setShowTypeDropdown(false)}>
                                <button
                                    onClick={() => { onTypeChange(undefined); setShowTypeDropdown(false); }}
                                    className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${!filterType ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Todos los tipos
                                </button>
                                {typeOptions.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { onTypeChange(type); setShowTypeDropdown(false); }}
                                        className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${filterType === type ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
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
                            className="px-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            title="Limpiar filtros"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
