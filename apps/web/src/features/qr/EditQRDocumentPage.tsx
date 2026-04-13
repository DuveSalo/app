import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FormControl,
  FormMessage,
} from '@/components/ui/form';

import { FileUpload } from '../../components/common/FileUpload';
import { DatePicker } from '../../components/common/DatePicker';
import { SkeletonForm } from '../../components/common/SkeletonLoader';
import { EyeIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';
import { editQRDocumentSchema, type EditQRDocumentFormValues } from './schemas';
import { openSupabaseStorageDocument } from '@/lib/utils/openSupabaseStorageDocument';

interface EditQRDocumentPageProps {
  qrType: QRDocumentType;
  title: string;
  listPath: string;
}

const EditQRDocumentPage = ({ qrType, title, listPath }: EditQRDocumentPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('');
  const [currentPdfPath, setCurrentPdfPath] = useState<string>('');

  const form = useForm<EditQRDocumentFormValues>({
    resolver: zodResolver(editQRDocumentSchema),
    mode: 'onBlur',
    defaultValues: {
      pdfFile: null,
      extractedDate: '',
    },
  });

  const loadDocument = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const doc = await api.getQRDocumentById(id);
      form.reset({
        extractedDate: doc.extractedDate,
        pdfFile: null,
      });
      setCurrentFileName(doc.pdfFileName || '');
      setCurrentPdfUrl(doc.pdfUrl || '');
      setCurrentPdfPath(doc.pdfPath || '');
    } catch (err: unknown) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Error al cargar el documento.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, form]);

  const handleOpenDocument = useCallback(async () => {
    try {
      await openSupabaseStorageDocument({
        bucket: 'qr-documents',
        path: currentPdfPath || undefined,
        url: currentPdfUrl || undefined,
        title: 'Abriendo PDF',
        message: 'Preparando una vista segura del documento QR.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al abrir el PDF';
      toast.error(message);
    }
  }, [currentPdfPath, currentPdfUrl]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const onSubmit = async (values: EditQRDocumentFormValues) => {
    if (!id) return;

    setIsSubmitting(true);

    try {
      await api.updateQRDocument(id, {
        type: qrType,
        documentName: values.pdfFile?.name || currentFileName,
        pdfFile: values.pdfFile ?? undefined,
        pdfFileName: values.pdfFile?.name || currentFileName,
        extractedDate: values.extractedDate,
      });
      toast.success('Documento guardado');
      navigate(listPath);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar el documento.';
      form.setError('root', { message });
      toast.error('Error al actualizar', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = `Editar Archivo - ${title}`;
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
        form="edit-form"
        type="submit"
        loading={isSubmitting}
        disabled={!form.watch('extractedDate')}
      >
        Guardar cambios
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <PageLayout title={pageTitle}>
        <SkeletonForm />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto">
          <Form {...form}>
            <form
              id="edit-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="p-4 bg-muted border border-border rounded-lg">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Archivo actual
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {currentFileName || 'Sin archivo'}
                  </p>
                  {(currentPdfUrl || currentPdfPath) && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void handleOpenDocument()}
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver PDF
                    </Button>
                  )}
                </div>
              </div>
              <div className="border-t border-border pt-5">
                <FormField
                  control={form.control}
                  name="pdfFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          label="Reemplazar Documento (opcional)"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onFileSelect={(file) => {
                            field.onChange(file);
                          }}
                          currentFileName={field.value?.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

export default EditQRDocumentPage;
