import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EventInformation } from '../../types/index';
import { ROUTE_PATHS, MOCK_COMPANY_ID } from '../../constants/index';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import { Input } from '../../components/common/Input';
import { DatePicker } from '../../components/common/DatePicker';
import { Button } from '@/components/ui/button';
import { Textarea } from '../../components/common/Textarea';
import { Checkbox } from '../../components/common/Checkbox';
import { DynamicListInput } from './components/DynamicListInput';
import { SkeletonForm } from '../../components/common/SkeletonLoader';
import PageLayout from '../../components/layout/PageLayout';
import { createLogger } from '../../lib/utils/logger';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  eventInformationSchema,
  type EventInformationFormData,
} from './schemas';

const logger = createLogger('CreateEditEventInformationPage');

const CreateEditEventInformationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [pageError, setPageError] = useState('');

  const form = useForm<EventInformationFormData>({
    resolver: zodResolver(eventInformationSchema),
    mode: 'onBlur',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      description: '',
      correctiveActions: '',
      physicalEvidenceDescription: '',
      testimonials: [],
      observations: [],
      finalChecks: {
        usoMatafuegos: false,
        requerimientosServicios: false,
        danoPersonas: false,
        danosEdilicios: false,
        evacuacion: false,
      },
    },
  });

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      setPageError('');
      api
        .getEventById(id)
        .then((eventToEdit) => {
          form.reset({
            date: eventToEdit.date,
            time: eventToEdit.time,
            description: eventToEdit.description,
            correctiveActions: eventToEdit.correctiveActions,
            physicalEvidenceDescription: eventToEdit.physicalEvidenceDescription || '',
            testimonials: (eventToEdit.testimonials || []).map((t) => ({ value: t })),
            observations: (eventToEdit.observations || []).map((o) => ({ value: o })),
            finalChecks: {
              usoMatafuegos: false,
              requerimientosServicios: false,
              danoPersonas: false,
              danosEdilicios: false,
              evacuacion: false,
              ...(eventToEdit.finalChecks || {}),
            },
          });
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Error al cargar datos del evento.';
          setPageError(message);
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [id]);

  const onSubmit = async (data: EventInformationFormData) => {
    setSaving(true);

    const fullApiData: Omit<EventInformation, 'id' | 'companyId'> = {
      ...data,
      testimonials: data.testimonials.map((t) => t.value),
      observations: data.observations.map((o) => o.value),
    };

    try {
      if (id) {
        await api.updateEvent({ ...fullApiData, id, companyId: MOCK_COMPANY_ID });
      } else {
        await api.createEvent(fullApiData);
      }
      toast.success('Evento guardado');
      navigate(ROUTE_PATHS.EVENT_INFORMATION);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el evento.';
      toast.error('Error al guardar', { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentCompany) {
      toast.error(
        'No se pudo encontrar la información de la empresa para descargar. Por favor, recargue la página.'
      );
      return;
    }

    const currentValues = form.getValues();
    const eventDataForPDF: EventInformation = {
      id: id || 'N/A',
      companyId: currentCompany.id,
      ...currentValues,
      testimonials: currentValues.testimonials.map((t) => t.value),
      observations: currentValues.observations.map((o) => o.value),
    };

    const prevSavingState = saving;
    setSaving(true);
    try {
      await api.downloadEventPDF(eventDataForPDF, currentCompany.name);
    } catch (error) {
      logger.error('PDF Download Error', error, { eventId: eventDataForPDF.id });
      toast.error('Ocurrió un error al generar el PDF.');
    } finally {
      setSaving(prevSavingState);
    }
  };

  const finalCheckItems = [
    { key: 'usoMatafuegos' as const, label: 'Uso de matafuegos y otros elementos de extinción.' },
    {
      key: 'requerimientosServicios' as const,
      label:
        'Requerimientos de servicios médicos privados, SAME, bomberos, Defensa Civil, Guardia de auxilio y Policia.',
    },
    { key: 'danoPersonas' as const, label: 'Daño a personas.' },
    { key: 'danosEdilicios' as const, label: 'Daños edilicios.' },
    { key: 'evacuacion' as const, label: 'Evacuación parcial o total del edificio.' },
  ];

  if (isLoadingData) return <SkeletonForm />;
  if (pageError)
    return (
      <div className="flex-grow flex justify-center items-center h-full">
        <p className="text-destructive text-center py-10">{pageError}</p>
      </div>
    );

  const pageTitle = id ? 'Editar Información del Evento' : 'Nueva Información del Evento';

  const footerActions = (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate(ROUTE_PATHS.EVENT_INFORMATION)}
        disabled={saving}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={handleDownloadPDF}
        disabled={!form.watch('description') || saving}
        title={
          !form.watch('description')
            ? 'Complete la descripción para descargar el PDF'
            : 'Descargar informe en PDF'
        }
      >
        Descargar PDF
      </Button>
      <Button form="event-form" type="submit" disabled={saving}>
        {saving ? 'Guardando...' : id ? 'Actualizar' : 'Guardar'}
      </Button>
    </>
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="p-4 bg-info/10 border-l-4 border-info rounded-md">
            <p className="text-sm text-foreground">
              Por favor, asegúrese de que el informe sea objetivo y no tenga la intención de señalar
              responsables. Este documento será presentado a la autoridad competente (UERESGP) para
              la implementación de medidas de seguridad en todas las escuelas.
            </p>
          </div>
          <Form {...form}>
            <form
              id="event-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          label="Fecha"
                          id="date"
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
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          label="Horario"
                          id="time"
                          type="time"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          label="Descripción Detallada"
                          id="description"
                          placeholder="Detalles completos del evento, incluyendo cualquier información relevante"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correctiveActions"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          label="Acciones Correctivas Propuestas"
                          id="correctiveActions"
                          placeholder="Acciones que se debe tomar para evitar futuros eventos similares"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="physicalEvidenceDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          label="Evidencias Físicas Disponibles"
                          id="physicalEvidenceDescription"
                          placeholder="Evidencias físicas relevantes que se puedan haber obtenido en el evento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                <DynamicListInput
                  label="Testimonios"
                  control={form.control}
                  name="testimonials"
                  placeholder="Testimonio"
                  addButtonLabel="Añadir testimonio"
                  description="Testimonios de las personas que estuvieron presentes en el evento"
                />
                <DynamicListInput
                  label="Observaciones"
                  control={form.control}
                  name="observations"
                  placeholder="Observación"
                  addButtonLabel="Añadir observación"
                />
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                <h4 className="text-sm font-medium text-foreground">Verificaciones Finales</h4>
                {finalCheckItems.map((check) => (
                  <FormField
                    key={check.key}
                    control={form.control}
                    name={`finalChecks.${check.key}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            id={`finalChecks.${check.key}`}
                            label={check.label}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateEditEventInformationPage;
