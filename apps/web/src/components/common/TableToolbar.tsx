import { type ReactNode } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FilterCountBadge,
  FilterOptionChip,
  StatusOptionChip,
  activeFilterButtonClasses,
  isExpirationStatus,
} from '@/components/common/TableFilterControls';
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
  additionalFilters,
}: TableToolbarProps) => {
  const selectedFilterLabel = filterValue
    ? filterOptions?.find((option) => option.value === filterValue)?.label
    : undefined;
  const activeFilterCount = filterValue ? 1 : 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpiar busqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {filterOptions && onFilterChange && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'border-border bg-background',
                  filterValue && activeFilterButtonClasses
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {selectedFilterLabel ?? 'Estado'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[240px]">
              <DropdownMenuItem
                onClick={() => onFilterChange('')}
                className={cn('py-2', !filterValue && 'bg-accent/60 text-accent-foreground')}
              >
                <FilterOptionChip icon={SlidersHorizontal} label="Todos los estados" />
              </DropdownMenuItem>
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={cn(
                    'py-2',
                    filterValue === option.value && 'bg-accent/60 text-accent-foreground'
                  )}
                >
                  {isExpirationStatus(option.value) ? (
                    <StatusOptionChip status={option.value} label={option.label} />
                  ) : (
                    <FilterOptionChip icon={SlidersHorizontal} label={option.label} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFilterCount > 0 ? <FilterCountBadge count={activeFilterCount} /> : null}
        </>
      )}

      {additionalFilters}

      {filterValue && onFilterChange && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onFilterChange('')}
          aria-label="Limpiar filtros"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
};
