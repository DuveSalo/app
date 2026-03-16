import { useState } from 'react';
import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Column } from '@tanstack/react-table';

const STATUS_OPTIONS = [
  { value: 'valid', label: 'Vigente' },
  { value: 'expiring', label: 'Por vencer' },
  { value: 'expired', label: 'Vencido' },
] as const;

interface StatusFilterProps<TData> {
  column: Column<TData, unknown> | undefined;
}

export function StatusFilter<TData>({ column }: StatusFilterProps<TData>) {
  const filterValue = (column?.getFilterValue() as string[] | undefined) ?? [];
  const [selected, setSelected] = useState<string[]>(filterValue);

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setSelected(next);
    column?.setFilterValue(next.length > 0 ? next : undefined);
  };

  const activeCount = selected.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="h-9">
          <ListFilter className="h-4 w-4" />
          Estado
          {activeCount > 0 && (
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => toggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Custom filter function for multi-select status filtering */
export function statusFilterFn<TData>(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: string[],
): boolean {
  if (!filterValue || filterValue.length === 0) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
}
