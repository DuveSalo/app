import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, ListFilter } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/Table';
import { useAuth } from '@/lib/auth/AuthContext';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/StatusBadge';
import PageLayout from '../../components/layout/PageLayout';
import { calculateExpirationStatus, formatDateLocal } from '../../lib/utils/dateUtils';
import { Empty } from '../../components/common/Empty';
import {
  FilterCountBadge,
  FilterOptionChip,
  StatusOptionChip,
  activeFilterButtonClasses,
} from '@/components/common/TableFilterControls';
import { cn } from '@/lib/utils';
import type { ExpirationStatus } from '@/types/expirable';
import { queryKeys } from '@/lib/queryKeys';
import { SelfProtectionSystemDetailPanel } from './components/SelfProtectionSystemDetailPanel';
import { SelfProtectionSystemMobileCard } from './components/SelfProtectionSystemMobileCard';

const STATUS_FILTER_OPTIONS: ReadonlyArray<{
  value: ExpirationStatus;
  label: string;
}> = [
  { value: 'valid', label: 'Vigente' },
  { value: 'expiring', label: 'Por vencer' },
  { value: 'expired', label: 'Vencido' },
];

const normalizeSearchValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const formatOptionalDate = (value?: string) => (value ? formatDateLocal(value) : 'Sin fecha');

const SelfProtectionSystemListPage = () => {
  const pageSize = 10;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpirationStatus[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: systems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.systems.list(currentCompany?.id ?? ''),
    queryFn: () => api.getSelfProtectionSystems(currentCompany!.id),
    enabled: !!currentCompany,
  });

  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al cargar sistemas de autoproteccion'
      );
    }
  }, [error]);

  const filteredSystems = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(searchValue);

    return systems.filter((system) => {
      const expirationStatus = calculateExpirationStatus(system.expirationDate);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(expirationStatus);

      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const searchIndex = normalizeSearchValue(
        `${system.intervener} ${system.registrationNumber ?? ''}`
      );

      return searchIndex.includes(normalizedSearch);
    });
  }, [searchValue, statusFilter, systems]);

  const totalRows = filteredSystems.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const paginatedSystems = useMemo(
    () => filteredSystems.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [filteredSystems, pageIndex, pageSize]
  );

  useEffect(() => {
    setPageIndex(0);
  }, [searchValue, statusFilter]);

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(totalPages - 1, 0));
    }
  }, [pageIndex, totalPages]);

  useEffect(() => {
    if (filteredSystems.length === 0) {
      if (selectedSystemId !== null) setSelectedSystemId(null);
      return;
    }
    const hasSelectedSystem = filteredSystems.some((system) => system.id === selectedSystemId);
    if (!hasSelectedSystem && selectedSystemId !== null) setSelectedSystemId(null);
  }, [filteredSystems, selectedSystemId]);

  useEffect(() => {
    if (selectedSystemId && !paginatedSystems.some((system) => system.id === selectedSystemId)) {
      setSelectedSystemId(null);
    }
  }, [paginatedSystems, selectedSystemId]);

  const selectedSystem = useMemo(
    () => paginatedSystems.find((system) => system.id === selectedSystemId) ?? null,
    [paginatedSystems, selectedSystemId]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.deleteSelfProtectionSystem(deleteId);
      toast.success('Sistema eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.systems.list(currentCompany!.id) });
      setSelectedSystemId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar el sistema');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const activeFilterCount = statusFilter.length;
  const hasActiveFilters = activeFilterCount > 0;
  const toggleStatusFilter = (value: ExpirationStatus) => {
    setStatusFilter((currentFilters) =>
      currentFilters.includes(value)
        ? currentFilters.filter((filterValue) => filterValue !== value)
        : [...currentFilters, value]
    );
  };

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM)}>
      <Plus className="w-4 h-4" />
      Nuevo sistema
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.SELF_PROTECTION_SYSTEMS} headerActions={headerActions}>
      {isLoading ? (
        <SkeletonTable />
      ) : systems.length === 0 ? (
        <Empty
          icon="file"
          title="No hay sistemas registrados"
          action={{
            label: 'Crear primer sistema',
            onClick: () => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM),
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar por nombre o matricula..."
                aria-label="Buscar por nombre o matricula"
                className="h-8 pl-9 pr-9"
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={() => setSearchValue('')}
                  aria-label="Limpiar busqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
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
                  onClick={() => setStatusFilter([])}
                  className={cn('py-2', !hasActiveFilters && 'bg-accent/60 text-accent-foreground')}
                >
                  <FilterOptionChip icon={ListFilter} label="Todos los estados" />
                </DropdownMenuItem>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={statusFilter.includes(option.value)}
                    onCheckedChange={() => toggleStatusFilter(option.value)}
                    className={cn(
                      'py-2',
                      statusFilter.includes(option.value) && 'bg-accent/60 text-accent-foreground'
                    )}
                  >
                    <StatusOptionChip status={option.value} label={option.label} />
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters ? <FilterCountBadge count={activeFilterCount} /> : null}
            {hasActiveFilters ? (
              <Button type="button" variant="ghost" onClick={() => setStatusFilter([])}>
                Limpiar filtros
              </Button>
            ) : null}
          </div>

          {filteredSystems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                No hay resultados para la busqueda actual.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajusta el texto o limpia el filtro de estado para volver a ver sistemas.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {searchValue ? (
                  <Button variant="ghost" onClick={() => setSearchValue('')}>
                    Limpiar busqueda
                  </Button>
                ) : null}
                {hasActiveFilters ? (
                  <Button variant="ghost" onClick={() => setStatusFilter([])}>
                    Quitar filtro de estado
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Mobile card list */}
              <div className="sm:hidden space-y-3">
                {paginatedSystems.map((system) => (
                  <SelfProtectionSystemMobileCard
                    key={system.id}
                    system={system}
                    onSelect={() => setSelectedSystemId(system.id)}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nombre/Referencia</TableHead>
                      <TableHead className="hidden sm:table-cell">Presentacion</TableHead>
                      <TableHead className="hidden sm:table-cell">Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSystems.map((system) => {
                      const expirationStatus = calculateExpirationStatus(system.expirationDate);
                      const isSelected = system.id === selectedSystemId;

                      return (
                        <TableRow
                          key={system.id}
                          className={cn(
                            'cursor-pointer transition-colors',
                            isSelected && 'bg-primary/5 hover:bg-primary/5'
                          )}
                          onClick={() => setSelectedSystemId(system.id)}
                          aria-selected={isSelected}
                        >
                          <TableCell
                            className={cn(
                              'px-4 py-4',
                              isSelected && 'border-l-2 border-l-primary bg-primary/[0.03]'
                            )}
                          >
                            <div className="space-y-1">
                              <p
                                className={cn(
                                  'text-sm font-semibold text-foreground',
                                  isSelected && 'text-primary'
                                )}
                              >
                                {system.intervener}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Matricula {system.registrationNumber || 'sin registrar'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell px-4 py-4 text-sm text-muted-foreground">
                            {formatOptionalDate(system.probatoryDispositionDate)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell px-4 py-4 text-sm text-muted-foreground">
                            {formatOptionalDate(system.expirationDate)}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge status={expirationStatus} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {totalRows === 0 ? 0 : pageIndex * pageSize + 1}-
                  {Math.min((pageIndex + 1) * pageSize, totalRows)} de {totalRows}
                </p>
                {totalPages > 1 ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPageIndex((currentPage) => Math.max(currentPage - 1, 0))}
                      disabled={pageIndex === 0}
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
                    {Array.from({ length: totalPages }, (_, index) => (
                      <Button
                        key={index}
                        variant={pageIndex === index ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => setPageIndex(index)}
                      >
                        {index + 1}
                      </Button>
                    )).slice(
                      Math.max(0, Math.min(pageIndex - 1, totalPages - 3)),
                      Math.max(3, Math.min(pageIndex + 2, totalPages))
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPageIndex((currentPage) => Math.min(currentPage + 1, totalPages - 1))
                      }
                      disabled={pageIndex === totalPages - 1}
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
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedSystem ? (
        <SelfProtectionSystemDetailPanel
          system={selectedSystem}
          onClose={() => setSelectedSystemId(null)}
          onDelete={(id) => setDeleteId(id)}
        />
      ) : null}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar sistema?"
        message="Esta accion no se puede deshacer. El sistema de autoproteccion sera eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default SelfProtectionSystemListPage;
