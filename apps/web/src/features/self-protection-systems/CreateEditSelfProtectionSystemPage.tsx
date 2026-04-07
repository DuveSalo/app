import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelfProtectionSystem } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { Input } from '../../components/common/Input';
import { DatePicker } from '../../components/common/DatePicker';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileUpload } from '../../components/common/FileUpload';
import { SkeletonForm } from '../../components/common/SkeletonLoader';
import { PdfPreview } from '../../components/common/PdfPreview';
import PageLayout from '../../components/layout/PageLayout';
import { TrashIcon, EyeIcon } from '../../components/common/Icons';
import { createLogger } from '../../lib/utils/logger';
import {
  selfProtectionSystemSchema,
  type SelfProtectionSystemFormValues,
  PRINCIPAL_FIELDS,
  SIMULACROS_FIELDS,
  PROFESIONAL_FIELDS,
} from './schemas';
import {
  openSelfProtectionSystemDocument,
  type SelfProtectionSystemDocumentReference,
} from './documentUtils';

const logger = createLogger('CreateEditSelfProtectionSystemPage');

const DEFAULT_VALUES: SelfProtectionSystemFormValues = {
  probatoryDispositionDate: '',
  probatoryDispositionPdf: undefined,
  probatoryDispositionPdfName: undefined,
  probatoryDispositionPdfUrl: undefined,
  probatoryDispositionPdfPath: undefined,
  extensionDate: '',
  extensionPdf: undefined,
  extensionPdfName: undefined,
  extensionPdfUrl: undefined,
  extensionPdfPath: undefined,
  expirationDate: '',
  drills: Array(4)
    .fill(null)
    .map(() => ({
      date: '',
      pdfFile: undefined,
      pdfFileName: undefined,
      pdfUrl: undefined,
      pdfPath: undefined,
    })),
  intervener: '',
  registrationNumber: '',
};

const SPS_TAB_KEYS = ['principal', 'simulacros', 'profesional'] as const;

const CreateEditSelfProtectionSystemPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [maxAllowedStep, setMaxAllowedStep] = useState(0);

  const form = useForm<SelfProtectionSystemFormValues>({
    resolver: zodResolver(selfProtectionSystemSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const probatoryDispositionDate = form.watch('probatoryDispositionDate');
  const drills = form.watch('drills');
  const drill0Date = form.watch('drills.0.date');
  const drill1Date = form.watch('drills.1.date');
  const drill2Date = form.watch('drills.2.date');
  const drill3Date = form.watch('drills.3.date');
  const intervener = form.watch('intervener');
  const registrationNumber = form.watch('registrationNumber');

  const isPrincipalComplete = !!probatoryDispositionDate;
  const isSimulacrosComplete = !!drill0Date && !!drill1Date && !!drill2Date && !!drill3Date;
  const isProfesionalComplete = !!intervener && !!registrationNumber;
  const isFormComplete = isPrincipalComplete && isSimulacrosComplete && isProfesionalComplete;

  useEffect(() => {
    if (isPrincipalComplete && isSimulacrosComplete) {
      setMaxAllowedStep(2);
    } else if (isPrincipalComplete) {
      setMaxAllowedStep(1);
    } else {
      setMaxAllowedStep(0);
    }
  }, [isPrincipalComplete, isSimulacrosComplete]);

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      setPageError('');
      api
        .getSelfProtectionSystemById(id)
        .then((systemToEdit: SelfProtectionSystem) => {
          const drillsData =
            systemToEdit.drills.length >= 4
              ? systemToEdit.drills.slice(0, 4)
              : Array(4)
                  .fill(null)
                  .map(
                    (_, i) =>
                      systemToEdit.drills[i] || {
                        date: '',
                        pdfFile: undefined,
                        pdfFileName: undefined,
                        pdfUrl: undefined,
                        pdfPath: undefined,
                      }
                  );
          form.reset({
            ...DEFAULT_VALUES,
            ...systemToEdit,
            drills: drillsData,
          });
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Error al cargar datos del sistema.';
          setPageError(message);
        })
        .finally(() => setIsLoadingData(false));
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [id]);

  // Auto-calculate extension and expiration dates
  useEffect(() => {
    if (probatoryDispositionDate) {
      try {
        const baseDate = new Date(probatoryDispositionDate);
        baseDate.setMinutes(baseDate.getMinutes() + baseDate.getTimezoneOffset());

        const extensionDate = new Date(baseDate);
        extensionDate.setFullYear(baseDate.getFullYear() + 1);

        const expirationDate = new Date(baseDate);
        expirationDate.setFullYear(baseDate.getFullYear() + 2);

        form.setValue('extensionDate', extensionDate.toISOString().split('T')[0]);
        form.setValue('expirationDate', expirationDate.toISOString().split('T')[0]);
      } catch (e) {
        logger.warn('Invalid date format for auto-calculation', {
          error: e,
          date: probatoryDispositionDate,
        });
      }
    }
  }, [probatoryDispositionDate]);

  const handleClearDrill = (index: number) => {
    form.setValue(`drills.${index}`, {
      date: '',
      pdfFile: undefined,
      pdfFileName: undefined,
      pdfUrl: undefined,
      pdfPath: undefined,
    });
  };

  const handleOpenDocument = useCallback(
    async (document: SelfProtectionSystemDocumentReference) => {
      try {
        await openSelfProtectionSystemDocument(document);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al abrir el PDF';
        toast.error(message);
      }
    },
    []
  );

  const onSubmit = async (data: SelfProtectionSystemFormValues) => {
    setSaving(true);
    setFormError('');
    try {
      if (id) {
        await api.updateSelfProtectionSystem({ ...data, id, companyId: '' });
      } else {
        await api.createSelfProtectionSystem(data);
      }
      toast.success('Sistema guardado');
      navigate(ROUTE_PATHS.SELF_PROTECTION_SYSTEMS);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el sistema';
      setFormError(message);
      toast.error('Error al guardar', { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (activeTab === 0) {
      const valid = await form.trigger([...PRINCIPAL_FIELDS]);
      if (!valid) return;
    } else if (activeTab === 1) {
      const valid = await form.trigger([...SIMULACROS_FIELDS]);
      if (!valid) return;
    }
    if (activeTab < 2) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const footerActions = useMemo(() => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(ROUTE_PATHS.SELF_PROTECTION_SYSTEMS)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleNext} disabled={!isPrincipalComplete}>
              Siguiente
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <Button type="button" variant="ghost" onClick={handleBack} disabled={saving}>
              Atrás
            </Button>
            <Button type="button" onClick={handleNext} disabled={!isSimulacrosComplete}>
              Siguiente
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Button type="button" variant="ghost" onClick={handleBack} disabled={saving}>
              Atrás
            </Button>
            <Button type="submit" form="sps-form" loading={saving} disabled={!isFormComplete}>
              {id ? 'Actualizar' : 'Guardar'}
            </Button>
          </>
        );
      default:
        return null;
    }
  }, [
    activeTab,
    saving,
    isPrincipalComplete,
    isSimulacrosComplete,
    isFormComplete,
    id,
    navigate,
    handleNext,
    handleBack,
  ]);

  if (isLoadingData) return <SkeletonForm />;
  if (pageError)
    return (
      <div className="flex-grow flex justify-center items-center h-full">
        <p className="text-destructive text-center py-10">{pageError}</p>
      </div>
    );

  const pageTitle = id ? 'Editar Sistema de Autoprotección' : 'Nuevo Sistema de Autoprotección';

  const currentTabKey = SPS_TAB_KEYS[activeTab];

  const handleTabChange = useCallback(
    (v: string) => setActiveTab(SPS_TAB_KEYS.indexOf(v as (typeof SPS_TAB_KEYS)[number])),
    []
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto">
          <Form {...form}>
            <form id="sps-form" onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs value={currentTabKey} onValueChange={handleTabChange}>
                <div className="overflow-x-auto">
                  <TabsList>
                    <TabsTrigger value="principal">Principal</TabsTrigger>
                    <TabsTrigger value="simulacros" disabled={maxAllowedStep < 1}>
                      Simulacros
                    </TabsTrigger>
                    <TabsTrigger value="profesional" disabled={maxAllowedStep < 2}>
                      Profesional
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="mt-4">
                  <TabsContent value="principal">
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
                                onChange={(value) => {
                                  field.onChange(value);
                                }}
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {id &&
                        (form.getValues('probatoryDispositionPdfPath') ||
                          form.getValues('probatoryDispositionPdfUrl')) &&
                        !form.getValues('probatoryDispositionPdf') && (
                          <div className="p-3 bg-muted border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">PDF actual:</p>
                                <p className="text-sm text-muted-foreground">
                                  {form.getValues('probatoryDispositionPdfName') ||
                                    'Disposición Aprobatoria'}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  void handleOpenDocument({
                                    path: form.getValues('probatoryDispositionPdfPath'),
                                    url: form.getValues('probatoryDispositionPdfUrl'),
                                  })
                                }
                              >
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
                                label={
                                  id
                                    ? 'Reemplazar PDF Disposición Aprobatoria (opcional)'
                                    : 'PDF Disposición Aprobatoria'
                                }
                                accept=".pdf"
                                currentFileName={form.getValues('probatoryDispositionPdfName')}
                                onFileSelect={(file) => {
                                  field.onChange(file || undefined);
                                  if (file) {
                                    form.setValue('probatoryDispositionPdfName', file.name);
                                  }
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
                                <DatePicker
                                  id="extensionDate"
                                  label="Fecha Extensión"
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  disabled
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {id &&
                        (form.getValues('extensionPdfPath') || form.getValues('extensionPdfUrl')) &&
                        !form.getValues('extensionPdf') && (
                          <div className="p-3 bg-muted border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">PDF actual:</p>
                                <p className="text-sm text-muted-foreground">
                                  {form.getValues('extensionPdfName') || 'Extensión'}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  void handleOpenDocument({
                                    path: form.getValues('extensionPdfPath'),
                                    url: form.getValues('extensionPdfUrl'),
                                  })
                                }
                              >
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
                                label={id ? 'Reemplazar PDF Extensión (opcional)' : 'PDF Extensión'}
                                accept=".pdf"
                                currentFileName={form.getValues('extensionPdfName')}
                                onFileSelect={(file) => {
                                  field.onChange(file || undefined);
                                  if (file) {
                                    form.setValue('extensionPdfName', file.name);
                                  }
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
                                <DatePicker
                                  id="expirationDate"
                                  label="Fecha Vencimiento"
                                  value={field.value}
                                  onChange={field.onChange}
                                  required
                                  disabled
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="simulacros">
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground">
                        Registre la información de los 4 simulacros requeridos. Se requiere la fecha
                        de los 4 simulacros para continuar.
                      </p>
                      {drills.map((drill, index) => (
                        <div key={index} className="p-4 border border-border bg-muted rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-foreground">
                              Simulacro {index + 1}
                            </h4>
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

                            {id && (drill.pdfPath || drill.pdfUrl) && !drill.pdfFile && (
                              <div className="p-3 bg-background border border-border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                      PDF actual:
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {drill.pdfFileName || `Simulacro ${index + 1}`}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      void handleOpenDocument({
                                        path: drill.pdfPath,
                                        url: drill.pdfUrl,
                                      })
                                    }
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
                                        id
                                          ? 'Reemplazar PDF del Simulacro (opcional)'
                                          : 'PDF del Simulacro'
                                      }
                                      accept=".pdf"
                                      currentFileName={drill.pdfFileName}
                                      onFileSelect={(file) => {
                                        field.onChange(file || undefined);
                                        if (file) {
                                          form.setValue(`drills.${index}.pdfFileName`, file.name);
                                        }
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
                  </TabsContent>

                  <TabsContent value="profesional">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="intervener"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="intervener"
                                label="Personal Interviniente"
                                {...field}
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="registrationNumber"
                                label="Matrícula"
                                {...field}
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
              {formError && (
                <p className="text-sm text-destructive mt-4 text-center">{formError}</p>
              )}
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateEditSelfProtectionSystemPage;
