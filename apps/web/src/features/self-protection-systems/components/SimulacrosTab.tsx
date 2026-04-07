import { UseFormReturn } from 'react-hook-form';
import { DatePicker } from '@/components/common/DatePicker';
import { FileUpload } from '@/components/common/FileUpload';
import { PdfPreview } from '@/components/common/PdfPreview';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { TrashIcon, EyeIcon } from '@/components/common/Icons';
import type { SelfProtectionSystemFormValues } from '../schemas';

interface SimulacrosTabProps {
  form: UseFormReturn<SelfProtectionSystemFormValues>;
  isEditing: boolean;
}

export const SimulacrosTab = ({ form, isEditing }: SimulacrosTabProps) => {
  const drills = form.watch('drills');

  const handleClearDrill = (index: number) => {
    form.setValue(`drills.${index}`, { date: '', pdfFile: undefined, pdfFileName: undefined });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Registre la información de los 4 simulacros requeridos. Se requiere la fecha de los 4
        simulacros para continuar.
      </p>
      {drills.map((drill, index) => (
        <div key={`drill-${index}`} className="p-4 border border-border bg-muted rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-foreground">Simulacro {index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleClearDrill(index)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2 py-1"
              aria-label={`Limpiar Simulacro ${index + 1}`}
            >
              <TrashIcon className="w-4 h-4" /> Limpiar
            </Button>
          </div>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`drills.${index}.date`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker
                      label="Fecha"
                      id={`drillDate-${index}`}
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && drill.pdfUrl && !drill.pdfFile && (
              <div className="p-3 bg-background border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">PDF actual:</p>
                    <p className="text-sm text-muted-foreground">
                      {drill.pdfFileName || `Simulacro ${index + 1}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => window.open(drill.pdfUrl, '_blank')}
                  >
                    <EyeIcon className="w-4 h-4" /> Ver PDF
                  </Button>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name={`drills.${index}.pdfFile`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      label={
                        isEditing ? 'Reemplazar PDF del Simulacro (opcional)' : 'PDF del Simulacro'
                      }
                      accept=".pdf"
                      currentFileName={drill.pdfFileName}
                      onFileSelect={(file) => {
                        field.onChange(file || undefined);
                        if (file) form.setValue(`drills.${index}.pdfFileName`, file.name);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <PdfPreview file={drill.pdfFile} />
          </div>
        </div>
      ))}
    </div>
  );
};
