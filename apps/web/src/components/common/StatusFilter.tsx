import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
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
import type { Column } from '@tanstack/react-table';
import type { ExpirationStatus } from '@/types/expirable';

const STATUS_OPTIONS = [
  { value: 'valid', label: 'Vigente' },
  { value: 'expiring', label: 'Por vencer' },
  { value: 'expired', label: 'Vencido' },
] as const satisfies ReadonlyArray<{ value: ExpirationStatus; label: string }>;

interface StatusFilterProps<TData> {
  column: Column<TData, unknown> | undefined;
}

export function StatusFilter<TData>({ column }: StatusFilterProps<TData>) {
  const rawFilterValue = column?.getFilterValue();
  const selected = Array.isArray(rawFilterValue) ? rawFilterValue.filter(isExpirationStatus) : [];

  const toggle = (value: ExpirationStatus) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];

    column?.setFilterValue(next.length > 0 ? next : undefined);
  };

  const activeCount = selected.length;
  const hasActiveFilters = activeCount > 0;
  const clearFilters = () => column?.setFilterValue(undefined);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            className={cn(
              'h-9 border border-border bg-background',
              hasActiveFilters && activeFilterButtonClasses
            )}
          >
            <ListFilter className="h-4 w-4" />
            Estado
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[240px]">
          <DropdownMenuItem
            onClick={clearFilters}
            className={cn('py-2', !hasActiveFilters && 'bg-accent/60 text-accent-foreground')}
          >
            <FilterOptionChip icon={ListFilter} label="Todos los estados" />
          </DropdownMenuItem>
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => toggle(option.value)}
              className={cn(
                'py-2',
                selected.includes(option.value) && 'bg-accent/60 text-accent-foreground'
              )}
            >
              <StatusOptionChip status={option.value} label={option.label} />
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters ? <FilterCountBadge count={activeCount} /> : null}

      {hasActiveFilters ? (
        <Button type="button" variant="ghost" onClick={clearFilters}>
          Limpiar filtros
        </Button>
      ) : null}
    </div>
  );
}

/** Custom filter function for multi-select status filtering */
export function statusFilterFn<TData>(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: ExpirationStatus[]
): boolean {
  if (!filterValue || filterValue.length === 0) return true;
  const status = row.getValue(columnId) as string;

  return isExpirationStatus(status) ? filterValue.includes(status) : false;
}
