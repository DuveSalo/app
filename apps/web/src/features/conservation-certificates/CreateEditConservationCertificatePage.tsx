import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { sanitizeInput } from '../../lib/utils/sanitize';
import { Input } from '../../components/common/Input';
import { DatePicker } from '../../components/common/DatePicker';
import { Button } from '@/components/ui/button';
import { FileUpload } from '../../components/common/FileUpload';
import { SkeletonForm } from '../../components/common/SkeletonLoader';
import { PdfPreview } from '../../components/common/PdfPreview';
import PageLayout from '../../components/layout/PageLayout';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  conservationCertificateSchema,
  type ConservationCertificateFormData,
} from './schemas';

const CreateEditConservationCertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<ConservationCertificateFormData>({
    resolver: zodResolver(conservationCertificateSchema),
    mode: 'onBlur',
    defaultValues: {
      presentationDate: '',
      expirationDate: '',
      intervener: '',
      registrationNumber: '',
      pdfFile: undefined,
      pdfFileName: undefined,
    },
  });

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      api
        .getCertificateById(id)
        .then((fetched) => {
          form.reset({
            presentationDate: fetched.presentationDate,
            expirationDate: fetched.expirationDate,
            intervener: fetched.intervener,
            registrationNumber: fetched.registrationNumber,
            pdfFile: undefined,
            pdfFileName: fetched.pdfFileName,
          });
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Error al cargar los datos';
          toast.error(message);
          navigate(ROUTE_PATHS.CONSERVATION_CERTIFICATES);
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [id]);

  const onSubmit = async (data: ConservationCertificateFormData) => {
    setSaving(true);
    try {
      const dataToSubmit = {
        ...data,
        intervener: sanitizeInput(data.intervener),
        registrationNumber: sanitizeInput(data.registrationNumber),
      };

      if (id) {
        await api.updateCertificate({ ...dataToSubmit, id, companyId: '' });
        toast.success('Certificado actualizado correctamente');
      } else {
        await api.createCertificate(dataToSubmit);
        toast.success('Certificado creado correctamente');
      }

      navigate(ROUTE_PATHS.CONSERVATION_CERTIFICATES);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar certificado');
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <PageLayout title="Cargando...">
        <SkeletonForm />
      </PageLayout>
    );
  }

  const pageTitle = id
    ? 'Editar Certificado de Conservación'
    : 'Nuevo Certificado de Conservación';

  const footerActions = (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate(ROUTE_PATHS.CONSERVATION_CERTIFICATES)}
        disabled={saving}
      >
        Cancelar
      </Button>
      <Button type="submit" form="certificate-form" disabled={saving}>
        {saving ? 'Guardando...' : id ? 'Actualizar' : 'Guardar'}
      </Button>
    </>
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto">
          <Form {...form}>
            <form
              id="certificate-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="presentationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          label="Fecha de Presentación"
                          id="presentationDate"
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          label="Fecha de Vencimiento"
                          id="expirationDate"
                          value={field.value}
                          onChange={field.onChange}
                          required
                          minDate={form.watch('presentationDate') || undefined}
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
                  name="intervener"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          label="Personal Interviniente"
                          id="intervener"
                          placeholder="Ej: Juan Pérez"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        label="Matrícula / Número de Registro"
                        id="registrationNumber"
                        placeholder="Ej: 12345"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-border pt-5">
                <FormField
                  control={form.control}
                  name="pdfFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          label="Subir PDF del Certificado"
                          accept=".pdf"
                          currentFileName={form.watch('pdfFileName')}
                          onFileSelect={(file) => {
                            field.onChange(file || undefined);
                            form.setValue(
                              'pdfFileName',
                              file?.name || form.getValues('pdfFileName')
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <PdfPreview file={form.watch('pdfFile')} />
              </div>
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateEditConservationCertificatePage;
