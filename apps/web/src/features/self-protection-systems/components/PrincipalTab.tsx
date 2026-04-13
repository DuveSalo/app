import { UseFormReturn } from 'react-hook-form';
import { DatePicker } from '@/components/common/DatePicker';
import { FileUpload } from '@/components/common/FileUpload';
import { PdfPreview } from '@/components/common/PdfPreview';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { EyeIcon } from '@/components/common/Icons';
import type { SelfProtectionSystemFormValues } from '../schemas';

interface PrincipalTabProps {
  form: UseFormReturn<SelfProtectionSystemFormValues>;
  isEditing: boolean;
}

export const PrincipalTab = ({ form, isEditing }: PrincipalTabProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="probatoryDispositionDate"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <DatePicker
                id="probatoryDispositionDate"
                label="Fecha Disposición Aprobatoria"
                value={field.value || ''}
                onChange={field.onChange}
                required
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isEditing && form.getValues('probatoryDispositionPdfUrl') && !form.getValues('probatoryDispositionPdf') && (
        <div className="p-3 bg-muted border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">PDF actual:</p>
              <p className="text-sm text-muted-foreground">{form.getValues('probatoryDispositionPdfName') || 'Disposición Aprobatoria'}</p>
            </div>
            <Button type="button" variant="ghost" onClick={() => window.open(form.getValues('probatoryDispositionPdfUrl'), '_blank')}>
              <EyeIcon className="w-4 h-4" /> Ver PDF
            </Button>
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="probatoryDispositionPdf"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <FileUpload
                label={isEditing ? "Reemplazar PDF Disposición Aprobatoria (opcional)" : "PDF Disposición Aprobatoria"}
                accept=".pdf"
                currentFileName={form.getValues('probatoryDispositionPdfName')}
                onFileSelect={(file) => {
                  field.onChange(file || undefined);
                  if (file) form.setValue('probatoryDispositionPdfName', file.name);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <PdfPreview file={form.watch('probatoryDispositionPdf')} />

      <div className="border-t border-border pt-4">
        <FormField
          control={form.control}
          name="extensionDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker id="extensionDate" label="Fecha Extensión" value={field.value || ''} onChange={field.onChange} disabled />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {isEditing && form.getValues('extensionPdfUrl') && !form.getValues('extensionPdf') && (
        <div className="p-3 bg-muted border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">PDF actual:</p>
              <p className="text-sm text-muted-foreground">{form.getValues('extensionPdfName') || 'Extensión'}</p>
            </div>
            <Button type="button" variant="ghost" onClick={() => window.open(form.getValues('extensionPdfUrl'), '_blank')}>
              <EyeIcon className="w-4 h-4" /> Ver PDF
            </Button>
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="extensionPdf"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <FileUpload
                label={isEditing ? "Reemplazar PDF Extensión (opcional)" : "PDF Extensión"}
                accept=".pdf"
                currentFileName={form.getValues('extensionPdfName')}
                onFileSelect={(file) => {
                  field.onChange(file || undefined);
                  if (file) form.setValue('extensionPdfName', file.name);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <PdfPreview file={form.watch('extensionPdf')} />

      <div className="border-t border-border pt-4">
        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker id="expirationDate" label="Fecha Vencimiento" value={field.value} onChange={field.onChange} required disabled />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
