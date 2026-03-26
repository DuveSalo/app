import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PdfPreview } from '@/components/common/PdfPreview';

interface AdminPdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  title?: string;
}

export const AdminPdfViewerModal = ({
  open,
  onOpenChange,
  url,
  title = 'Vista previa del documento',
}: AdminPdfViewerModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <PdfPreview file={url} />
        </div>
        {url && (
          <div className="flex justify-end pt-2">
            <Button variant="ghost" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir en nueva pestaña
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
