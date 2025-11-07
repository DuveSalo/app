
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventInformation } from '../../types/index';
import { ROUTE_PATHS, MOCK_COMPANY_ID } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useAuth } from '../auth/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Textarea';
import { Checkbox } from '../../components/common/Checkbox';
import { DynamicListInput } from '../../components/common/DynamicListInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageLayout from '../../components/layout/PageLayout';

interface EventFormDataType {
  date: string;
  time: string;
  description: string;
  correctiveActions: string;
  testimonials: string[];
  observations: string[];
  finalChecks: { [key: string]: boolean };
}

const createInitialFormState = (): EventFormDataType => ({
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
  description: '',
  correctiveActions: '',
  testimonials: [],
  observations: [],
  finalChecks: {
    usoMatafuegos: false,
    requerimientosServicios: false,
    danoPersonas: false,
    danosEdilicios: false,
    evacuacion: false,
  },
});

const CreateEditEventInformationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');

  const [currentFormData, setCurrentFormData] = useState<EventFormDataType>(createInitialFormState());

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      setPageError('');
      api.getEventById(id)
        .then(eventToEdit => {
          setCurrentFormData({
            date: eventToEdit.date,
            time: eventToEdit.time,
            description: eventToEdit.description,
            correctiveActions: eventToEdit.correctiveActions,
            testimonials: eventToEdit.testimonials || [],
            observations: eventToEdit.observations || [],
            finalChecks: {
              ...(createInitialFormState().finalChecks),
              ...(eventToEdit.finalChecks || {}),
            },
          });
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Error al cargar datos del evento.";
          setPageError(message);
          setCurrentFormData(createInitialFormState());
        })
        .finally(() => setIsLoadingData(false));
    } else {
      setCurrentFormData(createInitialFormState());
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
       if (name.startsWith("finalChecks.")) {
        const checkKey = name.split(".")[1];
        setCurrentFormData(prev => ({ ...prev, finalChecks: { ...prev.finalChecks, [checkKey]: checked } }));
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    
    const fullApiData: Omit<EventInformation, 'id' | 'companyId'> = {
      ...currentFormData,
      physicalEvidence: [], 
      physicalEvidenceNames: [],
    };

    try {
      if (id) {
        await api.updateEvent({ ...fullApiData, id, companyId: MOCK_COMPANY_ID });
      } else {
        await api.createEvent(fullApiData);
      }
      navigate(ROUTE_PATHS.EVENT_INFORMATION);
    } catch (err: any) {
      setFormError((err as Error).message || "Error al guardar el evento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentCompany) {
      alert("No se pudo encontrar la información de la empresa para descargar. Por favor, recargue la página.");
      return;
    }

    // Create an EventInformation object directly from the current form state.
    // This works for both creating a new event and editing an existing one.
    const eventDataForPDF: EventInformation = {
      id: id || 'N/A', // The ID is not critical for the PDF content itself
      companyId: currentCompany.id,
      ...currentFormData,
      physicalEvidence: [], // These are not included in the PDF
      physicalEvidenceNames: [],
    };

    const prevSubmittingState = isSubmitting;
    setIsSubmitting(true); // Disable buttons during PDF generation
    try {
      await api.downloadEventPDF(eventDataForPDF, currentCompany.name);
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Ocurrió un error al generar el PDF.");
    } finally {
      setIsSubmitting(prevSubmittingState); // Restore previous submitting state
    }
  };


  const finalCheckItems = [
    { key: 'usoMatafuegos', label: "Uso de matafuegos y otros elementos de extinción." },
    { key: 'requerimientosServicios', label: "Requerimientos de servicios médicos privados, SAME, bomberos, Defensa Civil, Guardia de auxilio y Policia." },
    { key: 'danoPersonas', label: "Daño a personas." },
    { key: 'danosEdilicios', label: "Daños edilicios." },
    { key: 'evacuacion', label: "Evacuación parcial o total del edificio." },
  ];

  if (isLoadingData) return <div className="flex-grow flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (pageError) return <div className="flex-grow flex justify-center items-center h-full"><p className="text-red-500 text-center py-10">{pageError}</p></div>;

  const pageTitle = id ? "Editar Información del Evento" : "Nueva Información del Evento";

  const footerActions = (
    <>
      <Button type="button" variant="outline" onClick={() => navigate(ROUTE_PATHS.EVENT_INFORMATION)} disabled={isSubmitting}>Cancelar</Button>
      <Button 
        type="button" 
        variant="secondary" 
        onClick={handleDownloadPDF} 
        disabled={!currentFormData.description || isSubmitting}
        title={!currentFormData.description ? "Complete la descripción para descargar el PDF" : "Descargar informe en PDF"}
      >
        Descargar PDF
      </Button>
      <Button form="event-form" type="submit" loading={isSubmitting} variant="primary">{id ? "Actualizar" : "Guardar"}</Button>
    </>
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Fecha" id="date" type="date" name="date" value={currentFormData.date} onChange={handleChange} required />
          <Input label="Horario" id="time" type="time" name="time" value={currentFormData.time} onChange={handleChange} required />
        </div>
        <Textarea label="Descripción Detallada" id="description" name="description" value={currentFormData.description} onChange={handleChange} required />
        <Textarea label="Acciones Correctivas Propuestas" id="correctiveActions" name="correctiveActions" value={currentFormData.correctiveActions} onChange={handleChange} required />

        <DynamicListInput
          label="Testimonios"
          items={currentFormData.testimonials}
          onChange={(items) => setCurrentFormData(p => ({...p, testimonials: items}))}
          placeholder="Testimonio"
          addButtonLabel="Añadir testimonio"
        />
        <DynamicListInput
          label="Observaciones"
          items={currentFormData.observations}
          onChange={(items) => setCurrentFormData(p => ({...p, observations: items}))}
          placeholder="Observación"
          addButtonLabel="Añadir observación"
        />

        <h4 className="text-md font-semibold pt-4 border-t border-gray-200 mt-5 text-gray-800">Verificaciones Finales</h4>
        {finalCheckItems.map(check => (
          <Checkbox
            key={check.key}
            label={check.label}
            id={`finalChecks.${check.key}`}
            name={`finalChecks.${check.key}`}
            checked={currentFormData.finalChecks?.[check.key] || false}
            onChange={handleCheckChange}
          />
        ))}
        {formError && <p className="text-sm text-red-500">{formError}</p>}
      </form>
    </PageLayout>
  );
};

export default CreateEditEventInformationPage;
