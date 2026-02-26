import { type ReactNode, useRef, useEffect, useState } from 'react';
import { Search, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  additionalFilters?: ReactNode;
}

const Dropdown = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div
      ref={ref}
      className="absolute top-full left-0 z-10 mt-1.5 min-w-[200px] bg-white border border-neutral-200 rounded-xl py-1.5 animate-fade-in shadow-dropdown"
    >
      {children}
    </div>
  );
};

export const FilterSort = ({
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
}: FilterSortProps) => {
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="flex items-center flex-wrap gap-2.5">
      {/* Search */}
      <div className="flex items-center w-[280px] h-10 px-3.5 gap-2.5 border border-neutral-300 rounded-lg flex-shrink-0 bg-white shadow-xs">
        <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 min-w-0 text-sm font-medium text-neutral-900 bg-transparent border-none focus:outline-none placeholder:text-neutral-400"
        />
        {searchValue && (
          <button onClick={() => onSearchChange('')} className="focus:outline-none">
            <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setShowSort(!showSort); setShowFilter(false); }}
          className="flex items-center h-10 px-3.5 gap-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-all duration-200 focus:outline-none shadow-xs"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
          <span>Ordenar</span>
        </button>
        <Dropdown isOpen={showSort} onClose={() => setShowSort(false)}>
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onSortChange(opt.value); setShowSort(false); }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm transition-colors hover:bg-neutral-50 focus:outline-none',
                sortValue === opt.value
                  ? 'font-medium text-neutral-900 bg-neutral-50'
                  : 'text-neutral-500'
              )}
            >
              {opt.label}
            </button>
          ))}
        </Dropdown>
      </div>

      {/* Status Filter */}
      {filterOptions && onFilterChange && (
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowFilter(!showFilter); setShowSort(false); }}
            className={cn(
              'flex items-center h-10 px-3.5 gap-2 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-all duration-200 focus:outline-none shadow-xs',
              filterValue
                ? 'border-2 border-brand-700'
                : 'border border-neutral-300'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <span>
              {filterValue ? filterOptions.find(o => o.value === filterValue)?.label : 'Estado'}
            </span>
          </button>
          <Dropdown isOpen={showFilter} onClose={() => setShowFilter(false)}>
            <button
              onClick={() => { onFilterChange(''); setShowFilter(false); }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm transition-colors hover:bg-neutral-50 focus:outline-none',
                !filterValue
                  ? 'font-medium text-neutral-900 bg-neutral-50'
                  : 'text-neutral-500'
              )}
            >
              Todos los estados
            </button>
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onFilterChange(opt.value); setShowFilter(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors hover:bg-neutral-50 focus:outline-none',
                  filterValue === opt.value
                    ? 'font-medium text-neutral-900 bg-neutral-50'
                    : 'text-neutral-500'
                )}
              >
                {opt.label}
              </button>
            ))}
          </Dropdown>
        </div>
      )}

      {/* Additional Filters */}
      {additionalFilters}

      {/* Clear filter */}
      {filterValue && onFilterChange && (
        <button
          onClick={() => onFilterChange('')}
          className="focus:outline-none"
          title="Limpiar filtro"
        >
          <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600" />
        </button>
      )}
    </div>
  );
};
