
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FireExtinguisherControl, ExtinguisherType, ExtinguisherCapacity } from '../../types/index';
import { ROUTE_PATHS, MOCK_COMPANY_ID } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { Checkbox } from '../../components/common/Checkbox';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import PageLayout from '../../components/layout/PageLayout';
import { Tabs } from '../../components/common/Tabs';

interface FormDataType {
  controlDate: string;
  extinguisherNumber: string;
  type: ExtinguisherType;
  capacity: ExtinguisherCapacity;
  class: string;
  positionNumber: string;
  chargeExpirationDate: string;
  hydraulicPressureExpirationDate: string;
  manufacturingYear: string;
  tagColor: string;
  labelsLegible: boolean;
  pressureWithinRange: boolean;
  hasSealAndSafety: boolean;
  instructionsLegible: boolean;
  containerCondition: string;
  nozzleCondition: string;
  visibilityObstructed: 'Sí' | 'No';
  accessObstructed: 'Sí' | 'No';
  signageCondition: string;
  signageFloor: 'Sí' | 'No' | 'N/A';
  signageWall: 'Sí' | 'No' | 'N/A';
  signageHeight: 'Sí' | 'No' | 'N/A';
  glassCondition: 'Sí' | 'No' | 'N/A';
  doorOpensEasily: 'Sí' | 'No' | 'N/A';
  cabinetClean: 'Sí' | 'No' | 'N/A';
  observations: string;
}

const createInitialFormState = (): FormDataType => ({
  controlDate: '',
  extinguisherNumber: '',
  type: '' as ExtinguisherType,
  capacity: '' as ExtinguisherCapacity,
  class: '',
  positionNumber: '',
  chargeExpirationDate: '',
  hydraulicPressureExpirationDate: '',
  manufacturingYear: '',
  tagColor: '',
  labelsLegible: false,
  pressureWithinRange: false,
  hasSealAndSafety: false,
  instructionsLegible: false,
  containerCondition: '',
  nozzleCondition: '',
  visibilityObstructed: '' as 'Sí' | 'No',
  accessObstructed: '' as 'Sí' | 'No',
  signageCondition: '',
  signageFloor: '' as 'Sí' | 'No' | 'N/A',
  signageWall: '' as 'Sí' | 'No' | 'N/A',
  signageHeight: '' as 'Sí' | 'No' | 'N/A',
  glassCondition: '' as 'Sí' | 'No' | 'N/A',
  doorOpensEasily: '' as 'Sí' | 'No' | 'N/A',
  cabinetClean: '' as 'Sí' | 'No' | 'N/A',
  observations: '',
});

const CreateEditFireExtinguisherPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [maxAllowedStep, setMaxAllowedStep] = useState(0);
  const [formData, setFormData] = useState<FormDataType>(createInitialFormState());

  // Validation for each step
  const isIdentificationComplete = useMemo(() =>
    !!formData.controlDate &&
    !!formData.extinguisherNumber &&
    !!formData.type &&
    !!formData.capacity &&
    !!formData.class,
    [formData.controlDate, formData.extinguisherNumber, formData.type, formData.capacity, formData.class]
  );

  const isLocationComplete = useMemo(() =>
    !!formData.positionNumber &&
    !!formData.chargeExpirationDate &&
    !!formData.hydraulicPressureExpirationDate &&
    !!formData.manufacturingYear &&
    !!formData.tagColor,
    [formData.positionNumber, formData.chargeExpirationDate, formData.hydraulicPressureExpirationDate, formData.manufacturingYear, formData.tagColor]
  );

  const isConditionsComplete = useMemo(() =>
    !!formData.containerCondition &&
    !!formData.nozzleCondition,
    [formData.containerCondition, formData.nozzleCondition]
  );

  const isCabinetComplete = useMemo(() =>
    !!formData.glassCondition &&
    !!formData.doorOpensEasily &&
    !!formData.cabinetClean,
    [formData.glassCondition, formData.doorOpensEasily, formData.cabinetClean]
  );

  const isAccessibilityComplete = useMemo(() =>
    !!formData.visibilityObstructed &&
    !!formData.accessObstructed,
    [formData.visibilityObstructed, formData.accessObstructed]
  );

  const isSignageComplete = useMemo(() =>
    !!formData.signageCondition &&
    !!formData.signageFloor &&
    !!formData.signageWall &&
    !!formData.signageHeight,
    [formData.signageCondition, formData.signageFloor, formData.signageWall, formData.signageHeight]
  );

  const isFormComplete = useMemo(() =>
    isIdentificationComplete &&
    isLocationComplete &&
    isConditionsComplete &&
    isCabinetComplete &&
    isAccessibilityComplete &&
    isSignageComplete,
    [isIdentificationComplete, isLocationComplete, isConditionsComplete, isCabinetComplete, isAccessibilityComplete, isSignageComplete]
  );

  // Update max allowed step based on completion
  useEffect(() => {
    if (isIdentificationComplete && isLocationComplete && isConditionsComplete && isCabinetComplete && isAccessibilityComplete && isSignageComplete) {
      setMaxAllowedStep(6);
    } else if (isIdentificationComplete && isLocationComplete && isConditionsComplete && isCabinetComplete && isAccessibilityComplete) {
      setMaxAllowedStep(5);
    } else if (isIdentificationComplete && isLocationComplete && isConditionsComplete && isCabinetComplete) {
      setMaxAllowedStep(4);
    } else if (isIdentificationComplete && isLocationComplete && isConditionsComplete) {
      setMaxAllowedStep(3);
    } else if (isIdentificationComplete && isLocationComplete) {
      setMaxAllowedStep(2);
    } else if (isIdentificationComplete) {
      setMaxAllowedStep(1);
    } else {
      setMaxAllowedStep(0);
    }
  }, [isIdentificationComplete, isLocationComplete, isConditionsComplete, isCabinetComplete, isAccessibilityComplete, isSignageComplete]);

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
    } catch (err: any) {
      setFormError((err as Error).message || "Error al guardar el control de extintor.");
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

  const canAdvanceFromCurrentTab = useCallback(() => {
    switch (activeTab) {
      case 0: return isIdentificationComplete;
      case 1: return isLocationComplete;
      case 2: return isConditionsComplete;
      case 3: return isCabinetComplete;
      case 4: return isAccessibilityComplete;
      case 5: return isSignageComplete;
      case 6: return true;
      default: return false;
    }
  }, [activeTab, isIdentificationComplete, isLocationComplete, isConditionsComplete, isCabinetComplete, isAccessibilityComplete, isSignageComplete]);

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
          disabled={!canAdvanceFromCurrentTab() || isSubmitting}
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
      content: (
        <div className="space-y-4">
          <Input
            label="Fecha de Control"
            id="controlDate"
            type="date"
            name="controlDate"
            value={formData.controlDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Número de Extintor"
            id="extinguisherNumber"
            type="text"
            name="extinguisherNumber"
            value={formData.extinguisherNumber}
            onChange={handleChange}
            placeholder="Ej: EXT-001"
            required
          />
          <Select
            label="Tipo"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            {Object.values(ExtinguisherType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Select
            label="Capacidad"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            {Object.values(ExtinguisherCapacity).map(cap => (
              <option key={cap} value={cap}>{cap} kg</option>
            ))}
          </Select>
          <Input
            label="Clase"
            id="class"
            type="text"
            name="class"
            value={formData.class}
            onChange={handleChange}
            placeholder="Ej: ABC"
            required
          />
        </div>
      )
    },
    {
      label: 'Ubicación e Información',
      disabled: maxAllowedStep < 1,
      content: (
        <div className="space-y-4">
          <Input
            label="Número de Puesto"
            id="positionNumber"
            type="text"
            name="positionNumber"
            value={formData.positionNumber}
            onChange={handleChange}
            placeholder="Ej: P-01"
            required
          />
          <Input
            label="Vencimiento de Vigencia de la Carga"
            id="chargeExpirationDate"
            type="date"
            name="chargeExpirationDate"
            value={formData.chargeExpirationDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Vencimiento de Vigencia de la Presión Hidráulica"
            id="hydraulicPressureExpirationDate"
            type="date"
            name="hydraulicPressureExpirationDate"
            value={formData.hydraulicPressureExpirationDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Año de Fabricación"
            id="manufacturingYear"
            type="text"
            name="manufacturingYear"
            value={formData.manufacturingYear}
            onChange={handleChange}
            placeholder="Ej: 2023"
            required
          />
          <Input
            label="Color de Marbete"
            id="tagColor"
            type="text"
            name="tagColor"
            value={formData.tagColor}
            onChange={handleChange}
            placeholder="Ej: Rojo"
            required
          />
        </div>
      )
    },
    {
      label: 'Condiciones Controladas',
      disabled: maxAllowedStep < 2,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Verificaciones</h4>
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Checkbox
                label="¿Están legibles las etiquetas identificatorias?"
                id="labelsLegible"
                name="labelsLegible"
                checked={formData.labelsLegible}
                onChange={handleCheckChange}
              />
              <Checkbox
                label="¿La presión está dentro del intervalo de funcionamiento?"
                id="pressureWithinRange"
                name="pressureWithinRange"
                checked={formData.pressureWithinRange}
                onChange={handleCheckChange}
              />
              <Checkbox
                label="¿Posee precinto y trabas de seguridad?"
                id="hasSealAndSafety"
                name="hasSealAndSafety"
                checked={formData.hasSealAndSafety}
                onChange={handleCheckChange}
              />
              <Checkbox
                label="¿Las instrucciones de funcionamiento están legibles?"
                id="instructionsLegible"
                name="instructionsLegible"
                checked={formData.instructionsLegible}
                onChange={handleCheckChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Estado del Recipiente"
              id="containerCondition"
              name="containerCondition"
              value={formData.containerCondition}
              onChange={handleChange}
              placeholder="Describa el estado del recipiente"
              rows={3}
              required
            />
            <Textarea
              label="Estado de Tobera"
              id="nozzleCondition"
              name="nozzleCondition"
              value={formData.nozzleCondition}
              onChange={handleChange}
              placeholder="Describa el estado de la tobera"
              rows={3}
              required
            />
          </div>
        </div>
      )
    },
    {
      label: 'Gabinete',
      disabled: maxAllowedStep < 3,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">Indique el estado del gabinete donde se encuentra el extintor.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="¿El vidrio está en condiciones?"
              id="glassCondition"
              name="glassCondition"
              value={formData.glassCondition}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
              <option value="N/A">N/A</option>
            </Select>
            <Select
              label="¿La puerta del gabinete se abre sin dificultad?"
              id="doorOpensEasily"
              name="doorOpensEasily"
              value={formData.doorOpensEasily}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
              <option value="N/A">N/A</option>
            </Select>
            <Select
              label="¿El gabinete está limpio?"
              id="cabinetClean"
              name="cabinetClean"
              value={formData.cabinetClean}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
              <option value="N/A">N/A</option>
            </Select>
          </div>
        </div>
      )
    },
    {
      label: 'Accesibilidad',
      disabled: maxAllowedStep < 4,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">Verifique la accesibilidad del extintor.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="¿Está obstruida su visibilidad?"
              id="visibilityObstructed"
              name="visibilityObstructed"
              value={formData.visibilityObstructed}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </Select>
            <Select
              label="¿Está obstruido su acceso?"
              id="accessObstructed"
              name="accessObstructed"
              value={formData.accessObstructed}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </Select>
          </div>
        </div>
      )
    },
    {
      label: 'Señalización',
      disabled: maxAllowedStep < 5,
      content: (
        <div className="space-y-4">
          <Textarea
            label="Estado y Conservación"
            id="signageCondition"
            name="signageCondition"
            value={formData.signageCondition}
            onChange={handleChange}
            placeholder="Describa el estado y conservación de la señalización del extintor"
            rows={3}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Select
              label="¿Posee en el piso?"
              id="signageFloor"
              name="signageFloor"
              value={formData.signageFloor}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
              <option value="N/A">N/A</option>
            </Select>
            <Select
              label="¿Posee en la pared?"
              id="signageWall"
              name="signageWall"
              value={formData.signageWall}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
              <option value="N/A">N/A</option>
            </Select>
            <Select
              label="¿Posee en altura?"
              id="signageHeight"
              name="signageHeight"
              value={formData.signageHeight}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
              <option value="N/A">N/A</option>
            </Select>
          </div>
        </div>
      )
    },
    {
      label: 'Observaciones',
      disabled: maxAllowedStep < 6,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">Agregue cualquier observación adicional sobre el control del extintor.</p>
          <Textarea
            label="Observaciones Generales"
            id="observations"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Ingrese observaciones generales sobre el control (opcional)"
            rows={6}
          />
          {formError && <p className="text-sm text-red-500 mt-4">{formError}</p>}
        </div>
      )
    }
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
