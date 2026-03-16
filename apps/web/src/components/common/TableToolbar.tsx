import { type ReactNode, useRef, useEffect, useState } from 'react';
import { Search, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TableToolbarProps {
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
      className="absolute top-full left-0 z-10 mt-1 min-w-[200px] rounded-md bg-background border border-border py-1 shadow-md"
    >
      {children}
    </div>
  );
};

export const TableToolbar = ({
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
}: TableToolbarProps) => {
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="flex items-center w-64 h-9 px-3 gap-2 rounded-md border border-input bg-background">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 min-w-0 text-sm text-foreground bg-transparent border-none focus:outline-none placeholder:text-muted-foreground"
        />
        {searchValue && (
          <button onClick={() => onSearchChange('')} className="focus:outline-none">
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          onClick={() => { setShowSort(!showSort); setShowFilter(false); }}
        >
          <ArrowUpDown className="w-4 h-4" />
          Ordenar
        </Button>
        <Dropdown isOpen={showSort} onClose={() => setShowSort(false)}>
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onSortChange(opt.value); setShowSort(false); }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted focus:outline-none',
                sortValue === opt.value
                  ? 'font-medium text-foreground bg-muted'
                  : 'text-muted-foreground'
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setShowFilter(!showFilter); setShowSort(false); }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {filterValue ? filterOptions.find(o => o.value === filterValue)?.label : 'Estado'}
          </Button>
          <Dropdown isOpen={showFilter} onClose={() => setShowFilter(false)}>
            <button
              onClick={() => { onFilterChange(''); setShowFilter(false); }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted focus:outline-none',
                !filterValue
                  ? 'font-medium text-foreground bg-muted'
                  : 'text-muted-foreground'
              )}
            >
              Todos los estados
            </button>
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onFilterChange(opt.value); setShowFilter(false); }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted focus:outline-none',
                  filterValue === opt.value
                    ? 'font-medium text-foreground bg-muted'
                    : 'text-muted-foreground'
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
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
};
