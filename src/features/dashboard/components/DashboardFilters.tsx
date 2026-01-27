import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

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

    return (
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-white flex flex-col gap-3">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o tipo..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100 placeholder-gray-400 text-gray-700"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {/* Sort Dropdown */}
                <div className="relative flex-1 min-w-[140px] sm:flex-none">
                    <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center justify-between sm:justify-start gap-2"
                    >
                        <span className="truncate">{sortOptions.find(o => o.value === sortBy)?.label || 'Ordenar por'}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                    {showSortDropdown && (
                        <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => { onSortChange(option.value); setShowSortDropdown(false); }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortBy === option.value ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative flex-1 min-w-[120px] sm:flex-none">
                    <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center justify-between sm:justify-start gap-2"
                    >
                        <span className="truncate">{filterStatus ? statusOptions.find(o => o.value === filterStatus)?.label : 'Estado'}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                    {showStatusDropdown && (
                        <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                            {statusOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => { onStatusChange(option.value || undefined); setShowStatusDropdown(false); }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterStatus === option.value ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Type Filter Dropdown */}
                {typeOptions.length > 0 && (
                    <div className="relative flex-1 min-w-[120px] sm:flex-none">
                        <button
                            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center justify-between sm:justify-start gap-2"
                        >
                            <span className="truncate">{filterType || 'Tipo'}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </button>
                        {showTypeDropdown && (
                            <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                                <button
                                    onClick={() => { onTypeChange(undefined); setShowTypeDropdown(false); }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${!filterType ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                                >
                                    Todos los tipos
                                </button>
                                {typeOptions.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { onTypeChange(type); setShowTypeDropdown(false); }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterType === type ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
