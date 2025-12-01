
import React from 'react';
import { Search, ArrowUpDown, ChevronDown } from 'lucide-react';

interface FilterSortProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: { value: string; label: string }[];
  searchPlaceholder?: string;
  additionalFilters?: React.ReactNode;
}

export const FilterSort: React.FC<FilterSortProps> = ({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  sortOptions,
  filterValue,
  onFilterChange,
  filterOptions,
  searchPlaceholder = 'Buscar...',
  additionalFilters
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 mb-4">
      {/* Search */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all duration-150"
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Filter */}
      {filterOptions && onFilterChange && (
        <div className="relative w-full md:w-44">
          <select
            value={filterValue || ''}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full appearance-none px-3.5 py-2.5 pr-9 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all duration-150 cursor-pointer"
          >
            <option value="">Todos los estados</option>
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      )}

      {/* Additional Filters */}
      {additionalFilters}

      {/* Sort */}
      <div className="relative w-full md:w-52">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
        </div>
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full appearance-none pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all duration-150 cursor-pointer"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};


