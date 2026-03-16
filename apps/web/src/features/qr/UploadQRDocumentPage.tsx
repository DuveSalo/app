import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QRDocumentType } from '../../types/index';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

import { FileUpload } from '../../components/common/FileUpload';
import { DatePicker } from '../../components/common/DatePicker';
import PageLayout from '../../components/layout/PageLayout';
import { uploadQRDocumentSchema, type UploadQRDocumentFormValues } from './schemas';

interface UploadQRDocumentPageProps {
  qrType: QRDocumentType;
  title: string;
  listPath: string;
}

const UploadQRDocumentPage = ({ qrType, title, listPath }: UploadQRDocumentPageProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UploadQRDocumentFormValues>({
    resolver: zodResolver(uploadQRDocumentSchema),
    mode: 'onBlur',
    defaultValues: {
      pdfFile: undefined,
      extractedDate: '',
    },
  });

  const pdfFile = form.watch('pdfFile');

  const onSubmit = async (values: UploadQRDocumentFormValues) => {
    setIsSubmitting(true);

    try {
      await api.uploadQRDocument({
        type: qrType,
        documentName: values.pdfFile.name,
        pdfFile: values.pdfFile,
        pdfFileName: values.pdfFile.name,
        extractedDate: values.extractedDate,
      });
      toast.success('Documento guardado');
      navigate(listPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir el documento.';
      form.setError('root', { message });
      toast.error('Error al subir', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = `Subir Archivo para ${title}`;
  const footerActions = (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate(listPath)}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        form="upload-form"
        type="submit"
        loading={isSubmitting}
        disabled={!pdfFile || !form.watch('extractedDate')}
      >
        Subir
      </Button>
    </>
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto">
          <Form {...form}>
            <form
              id="upload-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="pdfFile"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUpload
                        label="Seleccionar Documento (Imagen o PDF)"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onFileSelect={(file) => {
                          field.onChange(file);
                          if (file) {
                            form.setValue(
                              'extractedDate',
                              new Date().toISOString().split('T')[0],
                            );
                          } else {
                            form.setValue('extractedDate', '');
                          }
                        }}
                        currentFileName={field.value?.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border-t border-border pt-5">
                <FormField
                  control={form.control}
                  name="extractedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          label="Fecha de Emisión del Documento"
                          id="extractedDate"
                          value={field.value}
                          onChange={field.onChange}
                          helperText="El vencimiento se calculará a 1 año de esta fecha."
                          required
                          disabled={!pdfFile}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {form.formState.errors.root && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.root.message}
                </p>
              )}
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
};

export default UploadQRDocumentPage;
