
import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

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
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Filter */}
      {filterOptions && onFilterChange && (
        <div className="w-full md:w-48">
          <select
            value={filterValue || ''}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
          >
            <option value="">Todos los estados</option>
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Additional Filters */}
      {additionalFilters}

      {/* Sort */}
      <div className="w-full md:w-56 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
        </div>
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};


