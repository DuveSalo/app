import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { AdminDocumentTable } from './AdminDocumentTable';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { ADMIN_MODULE_LABELS, type AdminDocumentModule } from '../types';

interface AdminDocumentSectionProps {
  module: AdminDocumentModule;
  count: number;
  companyId: string;
}

export const AdminDocumentSection = ({
  module,
  count,
  companyId,
}: AdminDocumentSectionProps) => {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (documents !== null) return; // use cache
    setLoading(true);
    try {
      const data = await api.getSchoolDocuments(companyId, module);
      setDocuments(data);
    } catch {
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  }, [companyId, module, documents]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSchoolDocuments(companyId, module);
      setDocuments(data);
    } catch {
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  }, [companyId, module]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) fetchDocuments();
  };

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger className="flex w-full items-center justify-between border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {ADMIN_MODULE_LABELS[module]}
          </span>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        {loading && documents === null ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : documents && documents.length > 0 ? (
          <AdminDocumentTable
            module={module}
            data={documents}
            companyId={companyId}
            onRefresh={handleRefresh}
          />
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sin documentos
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
