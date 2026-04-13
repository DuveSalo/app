import { useState, type ReactNode } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table as TableInstance,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/Table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchKey?: string;
  toolbar?: ReactNode | ((table: TableInstance<TData>) => ReactNode);
  pageSize?: number;
  cardRenderer?: (row: TData) => ReactNode;
  cardOnly?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  searchKey,
  toolbar,
  pageSize = 10,
  cardRenderer,
  cardOnly = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize } },
  });

  const searchValue = searchKey
    ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? '')
    : '';

  const pageIndex = table.getState().pagination.pageIndex;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const totalPages = table.getPageCount();

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      {(searchKey || toolbar) && (
        <div className="flex items-center gap-2">
          {searchKey && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
                aria-label={searchPlaceholder}
                className="pl-9 h-8"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => table.getColumn(searchKey)?.setFilterValue('')}
                  aria-label="Limpiar busqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          {typeof toolbar === 'function' ? toolbar(table) : toolbar}
        </div>
      )}

      {/* Table */}
      {cardRenderer ? (
        <>
          {/* Card list */}
          <div className={cn('space-y-3', !cardOnly && 'sm:hidden')}>
            {table.getRowModel().rows.length ? (
              table
                .getRowModel()
                .rows.map((row) => <div key={row.id}>{cardRenderer(row.original)}</div>)
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">Sin resultados.</p>
            )}
          </div>
          {/* Desktop table (hidden when cardOnly) */}
          <div className={cn('hidden', !cardOnly && 'sm:block')}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'text-xs font-medium text-muted-foreground h-8 px-4 bg-muted/50',
                          header.column.columnDef.meta?.hideOnMobile && 'hidden sm:table-cell'
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'text-sm py-3 px-4',
                            cell.column.columnDef.meta?.hideOnMobile && 'hidden sm:table-cell'
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Sin resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-xs font-medium text-muted-foreground h-8 px-4 bg-muted/50',
                        header.column.columnDef.meta?.hideOnMobile && 'hidden sm:table-cell'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'text-sm py-3 px-4',
                          cell.column.columnDef.meta?.hideOnMobile && 'hidden sm:table-cell'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Sin resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {from}–{to} de {totalRows}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Anterior</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.842 3.135a.5.5 0 0 1 .023.707L5.435 7.5l3.43 3.658a.5.5 0 0 1-.73.684l-3.75-4a.5.5 0 0 1 0-.684l3.75-4a.5.5 0 0 1 .707-.023Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={pageIndex === i ? 'default' : 'ghost'}
                size="icon"
                onClick={() => table.setPageIndex(i)}
              >
                {i + 1}
              </Button>
            )).slice(
              Math.max(0, Math.min(pageIndex - 1, totalPages - 3)),
              Math.max(3, Math.min(pageIndex + 2, totalPages))
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Siguiente</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.158 3.135a.5.5 0 0 0-.023.707L9.565 7.5l-3.43 3.658a.5.5 0 1 0 .73.684l3.75-4a.5.5 0 0 0 0-.684l-3.75-4a.5.5 0 0 0-.707-.023Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
