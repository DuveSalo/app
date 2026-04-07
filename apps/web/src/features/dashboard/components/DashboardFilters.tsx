import { Search, SlidersHorizontal, Layers, X } from 'lucide-react';
import {
  FilterCountBadge,
  FilterOptionChip,
  StatusOptionChip,
  activeFilterButtonClasses,
  isExpirationStatus,
} from '@/components/common/TableFilterControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  const hasActiveFilters = Boolean(filterStatus || filterType);
  const activeFilterCount = Number(Boolean(filterStatus)) + Number(Boolean(filterType));

  return (
    <div className="flex items-center flex-wrap gap-3">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar documentos..."
          aria-label="Buscar documentos"
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpiar busqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn('border-border bg-background', filterStatus && activeFilterButtonClasses)}
          >
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            {filterStatus
              ? statusOptions.find((option) => option.value === filterStatus)?.label
              : 'Estado'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[240px]">
          <DropdownMenuItem
            onClick={() => onStatusChange(undefined)}
            className={cn('py-2', !filterStatus && 'bg-accent/60 text-accent-foreground')}
          >
            <FilterOptionChip icon={SlidersHorizontal} label="Todos los estados" />
          </DropdownMenuItem>
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onStatusChange(option.value || undefined)}
              className={cn(
                'py-2',
                filterStatus === option.value && 'bg-accent/60 text-accent-foreground'
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

      {typeOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={cn('border-border bg-background', filterType && activeFilterButtonClasses)}
            >
              <Layers className="w-4 h-4 text-muted-foreground" />
              {filterType ?? 'Tipo'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[240px]">
            <DropdownMenuItem
              onClick={() => onTypeChange(undefined)}
              className={cn('py-2', !filterType && 'bg-accent/60 text-accent-foreground')}
            >
              <FilterOptionChip icon={Layers} label="Todos los tipos" />
            </DropdownMenuItem>
            {typeOptions.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => onTypeChange(type)}
                className={cn('py-2', filterType === type && 'bg-accent/60 text-accent-foreground')}
              >
                <FilterOptionChip icon={Layers} label={type} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {hasActiveFilters ? <FilterCountBadge count={activeFilterCount} /> : null}

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            onStatusChange(undefined);
            onTypeChange(undefined);
          }}
          aria-label="Limpiar filtros"
        >
          <X className="w-4 h-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
};
