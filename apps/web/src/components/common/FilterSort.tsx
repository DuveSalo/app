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
      className="absolute top-full left-0 z-10 mt-1 min-w-[200px] rounded-md bg-white border border-neutral-200 py-1 shadow-md animate-dropdown-in"
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
    <div className="flex items-center flex-wrap gap-2">
      {/* Search */}
      <div className="flex items-center w-[260px] h-8 px-3 gap-2 rounded-md border border-neutral-200 flex-shrink-0 bg-white">
        <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 min-w-0 text-sm text-neutral-900 bg-transparent border-none focus:outline-none placeholder:text-neutral-400"
        />
        {searchValue && (
          <button onClick={() => onSearchChange('')} className="focus:outline-none">
            <X className="w-3 h-3 text-neutral-400 hover:text-neutral-600" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setShowSort(!showSort); setShowFilter(false); }}
          className="flex items-center h-8 px-3 gap-1.5 rounded-md border border-neutral-200 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none"
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
                'w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 focus:outline-none',
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
              'flex items-center h-8 px-3 gap-1.5 rounded-md text-sm font-medium bg-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none border',
              filterValue
                ? 'border-neutral-900 text-neutral-900'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
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
                'w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 focus:outline-none',
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
                  'w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 focus:outline-none',
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
