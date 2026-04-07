import { type ReactNode, type LucideIcon } from 'react';
import {
  X,
  Pencil,
  Trash2,
  Eye,
  CalendarDays,
  FileText,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { calculateExpirationStatus, formatDateLocal } from '@/lib/utils/dateUtils';
import { ROUTE_PATHS } from '@/constants/index';
import type { SelfProtectionSystem } from '@/types/index';
import {
  openSelfProtectionSystemDocument,
  type SelfProtectionSystemDocumentReference,
} from '../documentUtils';
import { toast } from 'sonner';

const panelCardClasses = 'rounded-lg border border-border/80 bg-background/95 p-4';

const rowItemClasses =
  'flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5';

const formatOptionalDate = (value?: string) => (value ? formatDateLocal(value) : 'Sin fecha');

interface DetailSectionProps {
  icon: LucideIcon;
  title: string;
  meta?: string;
  children: ReactNode;
}

const DetailSection = ({ icon: Icon, title, meta, children }: DetailSectionProps) => (
  <section className={panelCardClasses}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-muted/30">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      {meta ? (
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {meta}
        </span>
      ) : null}
    </div>
    <div className="space-y-2">{children}</div>
  </section>
);

interface DetailItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const DetailItem = ({ icon: Icon, label, value }: DetailItemProps) => (
  <div className={rowItemClasses}>
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

interface DocumentRowProps {
  title: string;
  date?: string;
  document?: SelfProtectionSystemDocumentReference;
  onOpen: (document: SelfProtectionSystemDocumentReference) => void;
}

const DocumentRow = ({ title, date, document, onOpen }: DocumentRowProps) => (
  <div className={rowItemClasses}>
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{formatOptionalDate(date)}</p>
    </div>
    {document?.path || document?.url ? (
      <Button variant="ghost" size="icon" onClick={() => onOpen(document)}>
        <Eye className="h-3.5 w-3.5" />
        Ver PDF
      </Button>
    ) : (
      <span className="text-[11px] font-medium text-muted-foreground">Sin PDF</span>
    )}
  </div>
);

interface DrillRowProps {
  index: number;
  date?: string;
  document?: SelfProtectionSystemDocumentReference;
  onOpen: (document: SelfProtectionSystemDocumentReference) => void;
}

const DrillRow = ({ index, date, document, onOpen }: DrillRowProps) => (
  <div className={rowItemClasses}>
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">Simulacro {index}</p>
      <p className="text-xs text-muted-foreground">{formatOptionalDate(date)}</p>
    </div>
    {document?.path || document?.url ? (
      <Button variant="ghost" size="icon" onClick={() => onOpen(document)}>
        <Eye className="h-3.5 w-3.5" />
        Ver PDF
      </Button>
    ) : (
      <span className="text-[11px] font-medium text-muted-foreground">Sin PDF</span>
    )}
  </div>
);

interface SelfProtectionSystemDetailPanelProps {
  system: SelfProtectionSystem;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const SelfProtectionSystemDetailPanel = ({
  system,
  onClose,
  onDelete,
}: SelfProtectionSystemDetailPanelProps) => {
  const navigate = useNavigate();
  const expirationStatus = calculateExpirationStatus(system.expirationDate);
  const drillSlots = Array.from({ length: 4 }, (_, index) => system.drills[index]);

  const handleOpenDocument = async (document: SelfProtectionSystemDocumentReference) => {
    try {
      await openSelfProtectionSystemDocument(document);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al abrir el PDF');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del sistema de autoproteccion"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[600px] border-l border-border bg-background/95 shadow-lg backdrop-blur-xl"
      >
        <div className="h-full overflow-y-auto p-4 custom-scrollbar sm:p-6">
          <div className="space-y-3">
            <section className={panelCardClasses}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div>
                    <h2 className="text-base font-semibold tracking-[-0.02em] text-foreground">
                      {system.intervener}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Matricula {system.registrationNumber || 'sin registrar'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <StatusBadge status={expirationStatus} className="rounded-full px-3 py-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                    aria-label="Cerrar panel lateral"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <DetailItem
                  icon={CalendarDays}
                  label="Presentacion"
                  value={formatOptionalDate(system.probatoryDispositionDate)}
                />
                <DetailItem
                  icon={CalendarDays}
                  label="Extension"
                  value={formatOptionalDate(system.extensionDate)}
                />
                <DetailItem
                  icon={BadgeCheck}
                  label="Vencimiento"
                  value={formatOptionalDate(system.expirationDate)}
                />
              </div>
            </section>

            <DetailSection icon={FileText} title="Documentacion">
              <DocumentRow
                title="Disposicion aprobatoria"
                date={system.probatoryDispositionDate}
                document={{
                  path: system.probatoryDispositionPdfPath,
                  url: system.probatoryDispositionPdfUrl,
                }}
                onOpen={handleOpenDocument}
              />
              <DocumentRow
                title="Extension"
                date={system.extensionDate}
                document={{
                  path: system.extensionPdfPath,
                  url: system.extensionPdfUrl,
                }}
                onOpen={handleOpenDocument}
              />
            </DetailSection>

            <DetailSection icon={ShieldCheck} title="Simulacros">
              {drillSlots.map((drill, index) => (
                <DrillRow
                  key={`${system.id}-drill-${index + 1}`}
                  index={index + 1}
                  date={drill?.date}
                  document={drill ? { path: drill.pdfPath, url: drill.pdfUrl } : undefined}
                  onOpen={handleOpenDocument}
                />
              ))}
            </DetailSection>

            <section className={panelCardClasses}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">Acciones</h3>
                <p className="text-xs text-muted-foreground">
                  Edita o elimina el sistema seleccionado desde este panel.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-center"
                  onClick={() =>
                    navigate(ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.replace(':id', system.id))
                  }
                >
                  <Pencil className="h-4 w-4" />
                  Editar sistema
                </Button>
                <Button
                  variant="ghost"
                  className="justify-center text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(system.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar sistema
                </Button>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </>
  );
};
