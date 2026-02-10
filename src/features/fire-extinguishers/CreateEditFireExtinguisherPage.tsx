import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FireExtinguisherControl } from '../../types/index';
import { ROUTE_PATHS, MOCK_COMPANY_ID } from '../../constants/index';
import * as api from '@/lib/api/services';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import PageLayout from '../../components/layout/PageLayout';
import { Tabs } from '../../components/common/Tabs';
import { FireExtinguisherFormData, createInitialFormState } from './types';
import { useFireExtinguisherValidation } from './hooks/useFireExtinguisherValidation';
import {
  IdentificationSection,
  LocationSection,
  ConditionsSection,
  CabinetSection,
  AccessibilitySection,
  SignageSection,
  ObservationsSection,
} from './components';

const CreateEditFireExtinguisherPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<FireExtinguisherFormData>(createInitialFormState());

  const { maxAllowedStep, isFormComplete, canAdvanceFromTab } = useFireExtinguisherValidation(formData);

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      setPageError('');
      api.getFireExtinguisherById(id)
        .then(extinguisher => {
          setFormData({
            controlDate: extinguisher.controlDate,
            extinguisherNumber: extinguisher.extinguisherNumber,
            type: extinguisher.type,
            capacity: extinguisher.capacity,
            class: extinguisher.class,
            positionNumber: extinguisher.positionNumber,
            chargeExpirationDate: extinguisher.chargeExpirationDate,
            hydraulicPressureExpirationDate: extinguisher.hydraulicPressureExpirationDate,
            manufacturingYear: extinguisher.manufacturingYear,
            tagColor: extinguisher.tagColor,
            labelsLegible: extinguisher.labelsLegible,
            pressureWithinRange: extinguisher.pressureWithinRange,
            hasSealAndSafety: extinguisher.hasSealAndSafety,
            instructionsLegible: extinguisher.instructionsLegible,
            containerCondition: extinguisher.containerCondition,
            nozzleCondition: extinguisher.nozzleCondition,
            visibilityObstructed: extinguisher.visibilityObstructed,
            accessObstructed: extinguisher.accessObstructed,
            signageCondition: extinguisher.signageCondition,
            signageFloor: extinguisher.signageFloor,
            signageWall: extinguisher.signageWall,
            signageHeight: extinguisher.signageHeight,
            glassCondition: extinguisher.glassCondition,
            doorOpensEasily: extinguisher.doorOpensEasily,
            cabinetClean: extinguisher.cabinetClean,
            observations: extinguisher.observations,
          });
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Error al cargar datos del extintor.";
          setPageError(message);
          setFormData(createInitialFormState());
        })
        .finally(() => setIsLoadingData(false));
    } else {
      setFormData(createInitialFormState());
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError('');

    const apiData: Omit<FireExtinguisherControl, 'id' | 'companyId'> = {
      ...formData,
    };

    try {
      if (id) {
        await api.updateFireExtinguisher({ ...apiData, id, companyId: MOCK_COMPANY_ID });
      } else {
        await api.createFireExtinguisher(apiData);
      }
      navigate(ROUTE_PATHS.FIRE_EXTINGUISHERS);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar el control de extintor.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = useCallback(() => {
    if (activeTab < 6) {
      setActiveTab(prev => prev + 1);
    }
  }, [activeTab]);

  const handleBack = useCallback(() => {
    if (activeTab > 0) {
      setActiveTab(prev => prev - 1);
    }
  }, [activeTab]);

  if (isLoadingData) return <div className="flex-grow flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (pageError) return <div className="flex-grow flex justify-center items-center h-full"><p className="text-red-500 text-center py-10">{pageError}</p></div>;

  const pageTitle = id ? "Editar Control de Extintor" : "Nuevo Control de Extintor";

  const footerActions = (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(ROUTE_PATHS.FIRE_EXTINGUISHERS)}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      {activeTab > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Anterior
        </Button>
      )}
      {activeTab < 6 ? (
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={!canAdvanceFromTab(activeTab) || isSubmitting}
        >
          Siguiente
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!isFormComplete}
        >
          {id ? "Actualizar" : "Guardar"}
        </Button>
      )}
    </div>
  );

  const formTabs = [
    {
      label: 'Identificación',
      disabled: false,
      content: <IdentificationSection formData={formData} onChange={handleChange} onFieldChange={handleFieldChange} />,
    },
    {
      label: 'Ubicación e Información',
      disabled: maxAllowedStep < 1,
      content: <LocationSection formData={formData} onChange={handleChange} onFieldChange={handleFieldChange} />,
    },
    {
      label: 'Condiciones Controladas',
      disabled: maxAllowedStep < 2,
      content: <ConditionsSection formData={formData} onChange={handleChange} onCheckChange={handleCheckChange} />,
    },
    {
      label: 'Gabinete',
      disabled: maxAllowedStep < 3,
      content: <CabinetSection formData={formData} onChange={handleChange} />,
    },
    {
      label: 'Accesibilidad',
      disabled: maxAllowedStep < 4,
      content: <AccessibilitySection formData={formData} onChange={handleChange} />,
    },
    {
      label: 'Señalización',
      disabled: maxAllowedStep < 5,
      content: <SignageSection formData={formData} onChange={handleChange} />,
    },
    {
      label: 'Observaciones',
      disabled: maxAllowedStep < 6,
      content: <ObservationsSection formData={formData} onChange={handleChange} formError={formError} />,
    },
  ];

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <Tabs
        tabs={formTabs}
        activeTab={activeTab}
        onTabClick={setActiveTab}
      />
    </PageLayout>
  );
};

export default CreateEditFireExtinguisherPage;
