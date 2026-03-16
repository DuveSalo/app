import { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronDown, Eye } from 'lucide-react';
import { SelfProtectionSystem } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '@/lib/auth/AuthContext';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/StatusBadge';
import PageLayout from '../../components/layout/PageLayout';
import { calculateExpirationStatus, formatDateLocal } from '../../lib/utils/dateUtils';
import { Empty } from '../../components/common/Empty';

const SelfProtectionSystemListPage = () => {
  const [systems, setSystems] = useState<SelfProtectionSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { currentCompany } = useAuth();

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const loadSystems = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getSelfProtectionSystems(currentCompany.id);
      setSystems(data);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al cargar sistemas de autoprotección');
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const prev = [...systems];
    setSystems((s) => s.filter((sys) => sys.id !== deleteId));
    try {
      await api.deleteSelfProtectionSystem(deleteId);
      showSuccess('Sistema eliminado correctamente');
    } catch (err: unknown) {
      setSystems(prev);
      showError(err instanceof Error ? err.message : 'Error al eliminar el sistema');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
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
        <div className="border border-border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground py-3 px-4 w-8" />
                <TableHead className="text-xs font-medium text-muted-foreground py-3 px-4">Nombre/Referencia</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-3 px-4">Fecha Presentación</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-3 px-4">Vencimiento</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-3 px-4">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systems.map((sys) => {
                const isOpen = expandedIds.has(sys.id);
                return (
                  <Fragment key={sys.id}>
                      <TableRow onClick={() => toggleExpanded(sys.id)}>
                        <TableCell className="py-3.5 px-4">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleExpanded(sys.id); }}>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm py-3.5 px-4 font-medium">{sys.intervener}</TableCell>
                        <TableCell className="text-sm py-3.5 px-4">{formatDateLocal(sys.probatoryDispositionDate)}</TableCell>
                        <TableCell className="text-sm py-3.5 px-4">{formatDateLocal(sys.expirationDate)}</TableCell>
                        <TableCell className="text-sm py-3.5 px-4">
                          <StatusBadge status={calculateExpirationStatus(sys.expirationDate)} />
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="bg-muted/50 px-4 py-4 border-b border-border">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Disposición Aprobatoria</p>
                                <p>{formatDateLocal(sys.probatoryDispositionDate)}</p>
                                {sys.probatoryDispositionPdfUrl && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7 mt-1" onClick={() => window.open(sys.probatoryDispositionPdfUrl, '_blank')}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Extensión</p>
                                <p>{sys.extensionDate ? formatDateLocal(sys.extensionDate) : '—'}</p>
                                {sys.extensionPdfUrl && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7 mt-1" onClick={() => window.open(sys.extensionPdfUrl, '_blank')}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Vencimiento</p>
                                <p>{formatDateLocal(sys.expirationDate)}</p>
                              </div>
                            </div>
                            {sys.drills && sys.drills.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs text-muted-foreground mb-2">Simulacros</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {sys.drills.map((drill, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                      <span className="text-muted-foreground">{i + 1}.</span>
                                      <span>{drill.date ? formatDateLocal(drill.date) : '—'}</span>
                                      {drill.pdfUrl && (
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(drill.pdfUrl, '_blank')}>
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="mt-4 text-sm">
                              <span className="text-xs text-muted-foreground">Matrícula: </span>
                              <span>{sys.registrationNumber || '—'}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                              <Button variant="ghost" size="default" onClick={() => navigate(ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.replace(':id', sys.id))}>
                                <Pencil className="h-4 w-4" />
                                Editar
                              </Button>
                              <Button variant="ghost" size="default" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(sys.id)}>
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar sistema?"
        message="Esta acción no se puede deshacer. El sistema de autoprotección será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default SelfProtectionSystemListPage;
