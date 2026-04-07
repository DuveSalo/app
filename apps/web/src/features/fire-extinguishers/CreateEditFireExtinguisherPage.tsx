import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FireExtinguisherControl } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SkeletonForm } from '../../components/common/SkeletonLoader';
import PageLayout from '../../components/layout/PageLayout';
import { fireExtinguisherSchema, type FireExtinguisherFormValues, TAB_FIELDS } from './schemas';
import {
  IdentificationSection,
  LocationSection,
  ConditionsSection,
  CabinetSection,
  AccessibilitySection,
  SignageSection,
  ObservationsSection,
} from './components';

const DEFAULT_VALUES: FireExtinguisherFormValues = {
  controlDate: '',
  extinguisherNumber: '',
  type: '' as FireExtinguisherFormValues['type'],
  capacity: '' as FireExtinguisherFormValues['capacity'],
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
  glassCondition: '' as FireExtinguisherFormValues['glassCondition'],
  doorOpensEasily: '' as FireExtinguisherFormValues['doorOpensEasily'],
  cabinetClean: '' as FireExtinguisherFormValues['cabinetClean'],
  visibilityObstructed: '' as FireExtinguisherFormValues['visibilityObstructed'],
  accessObstructed: '' as FireExtinguisherFormValues['accessObstructed'],
  signageCondition: '',
  signageFloor: '' as FireExtinguisherFormValues['signageFloor'],
  signageWall: '' as FireExtinguisherFormValues['signageWall'],
  signageHeight: '' as FireExtinguisherFormValues['signageHeight'],
  observations: '',
};

const TAB_KEYS = [
  'identification',
  'location',
  'conditions',
  'cabinet',
  'accessibility',
  'signage',
  'observations',
] as const;

const CreateEditFireExtinguisherPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const form = useForm<FireExtinguisherFormValues>({
    resolver: zodResolver(fireExtinguisherSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  });

  // Watch fields needed for tab completion checks
  const controlDate = form.watch('controlDate');
  const extinguisherNumber = form.watch('extinguisherNumber');
  const type = form.watch('type');
  const capacity = form.watch('capacity');
  const extClass = form.watch('class');

  const positionNumber = form.watch('positionNumber');
  const chargeExpirationDate = form.watch('chargeExpirationDate');
  const hydraulicPressureExpirationDate = form.watch('hydraulicPressureExpirationDate');
  const manufacturingYear = form.watch('manufacturingYear');
  const tagColor = form.watch('tagColor');

  const containerCondition = form.watch('containerCondition');
  const nozzleCondition = form.watch('nozzleCondition');

  const glassCondition = form.watch('glassCondition');
  const doorOpensEasily = form.watch('doorOpensEasily');
  const cabinetClean = form.watch('cabinetClean');

  const visibilityObstructed = form.watch('visibilityObstructed');
  const accessObstructed = form.watch('accessObstructed');

  const signageCondition = form.watch('signageCondition');
  const signageFloor = form.watch('signageFloor');
  const signageWall = form.watch('signageWall');
  const signageHeight = form.watch('signageHeight');

  const isIdentificationComplete = useMemo(
    () => !!controlDate && !!extinguisherNumber && !!type && !!capacity && !!extClass,
    [controlDate, extinguisherNumber, type, capacity, extClass]
  );
  const isLocationComplete = useMemo(
    () =>
      !!positionNumber &&
      !!chargeExpirationDate &&
      !!hydraulicPressureExpirationDate &&
      !!manufacturingYear &&
      !!tagColor,
    [
      positionNumber,
      chargeExpirationDate,
      hydraulicPressureExpirationDate,
      manufacturingYear,
      tagColor,
    ]
  );
  const isConditionsComplete = useMemo(
    () => !!containerCondition && !!nozzleCondition,
    [containerCondition, nozzleCondition]
  );
  const isCabinetComplete = useMemo(
    () => !!glassCondition && !!doorOpensEasily && !!cabinetClean,
    [glassCondition, doorOpensEasily, cabinetClean]
  );
  const isAccessibilityComplete = useMemo(
    () => !!visibilityObstructed && !!accessObstructed,
    [visibilityObstructed, accessObstructed]
  );
  const isSignageComplete = useMemo(
    () => !!signageCondition && !!signageFloor && !!signageWall && !!signageHeight,
    [signageCondition, signageFloor, signageWall, signageHeight]
  );

  const tabCompletions = useMemo(
    () => [
      isIdentificationComplete,
      isLocationComplete,
      isConditionsComplete,
      isCabinetComplete,
      isAccessibilityComplete,
      isSignageComplete,
    ],
    [
      isIdentificationComplete,
      isLocationComplete,
      isConditionsComplete,
      isCabinetComplete,
      isAccessibilityComplete,
      isSignageComplete,
    ]
  );

  const maxAllowedStep = useMemo(() => {
    let step = 0;
    for (let i = 0; i < tabCompletions.length; i++) {
      if (tabCompletions[i]) {
        step = i + 1;
      } else {
        break;
      }
    }
    return step;
  }, [tabCompletions]);

  const isFormComplete = useMemo(() => tabCompletions.every(Boolean), [tabCompletions]);

  const canAdvanceFromTab = useCallback(
    (tab: number): boolean => {
      if (tab >= 0 && tab < tabCompletions.length) return tabCompletions[tab];
      if (tab === 6) return true; // observations tab — always passable
      return false;
    },
    [tabCompletions]
  );

  const handleTabChange = useCallback(
    (v: string) => setActiveTab(TAB_KEYS.indexOf(v as (typeof TAB_KEYS)[number])),
    []
  );

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      setPageError('');
      api
        .getFireExtinguisherById(id)
        .then((extinguisher: FireExtinguisherControl) => {
          form.reset({
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
          const message =
            error instanceof Error ? error.message : 'Error al cargar datos del extintor.';
          setPageError(message);
        })
        .finally(() => setIsLoadingData(false));
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [id]);

  const onSubmit = async (data: FireExtinguisherFormValues) => {
    setSaving(true);
    setFormError('');

    const apiData: Omit<FireExtinguisherControl, 'id' | 'companyId'> = {
      ...data,
    };

    try {
      if (id) {
        await api.updateFireExtinguisher({ ...apiData, id, companyId: '' });
      } else {
        await api.createFireExtinguisher(apiData);
      }
      toast.success('Extintor guardado');
      navigate(ROUTE_PATHS.FIRE_EXTINGUISHERS);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al guardar el control de extintor.';
      setFormError(message);
      toast.error('Error al guardar', { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = useCallback(async () => {
    if (activeTab < 6) {
      const fieldsForTab = TAB_FIELDS[activeTab];
      if (fieldsForTab) {
        const valid = await form.trigger([...fieldsForTab]);
        if (!valid) return;
      }
      setActiveTab((prev) => prev + 1);
    }
  }, [activeTab, form]);

  const handleBack = useCallback(() => {
    if (activeTab > 0) {
      setActiveTab((prev) => prev - 1);
    }
  }, [activeTab]);

  if (isLoadingData) return <SkeletonForm />;
  if (pageError)
    return (
      <div className="flex-grow flex justify-center items-center h-full">
        <p className="text-destructive text-center py-10">{pageError}</p>
      </div>
    );

  const pageTitle = id ? 'Editar Control de Extintor' : 'Nuevo Control de Extintor';

  const footerActions = (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate(ROUTE_PATHS.FIRE_EXTINGUISHERS)}
        disabled={saving}
      >
        Cancelar
      </Button>
      {activeTab > 0 && (
        <Button type="button" variant="ghost" onClick={handleBack} disabled={saving}>
          Anterior
        </Button>
      )}
      {activeTab < 6 ? (
        <Button
          type="button"
          onClick={handleNext}
          disabled={!canAdvanceFromTab(activeTab) || saving}
        >
          Siguiente
        </Button>
      ) : (
        <Button
          type="submit"
          form="fire-extinguisher-form"
          loading={saving}
          disabled={!isFormComplete}
        >
          {id ? 'Actualizar' : 'Guardar'}
        </Button>
      )}
    </div>
  );

  const currentTabKey = TAB_KEYS[activeTab];

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <Form {...form}>
        <form id="fire-extinguisher-form" onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={currentTabKey} onValueChange={handleTabChange}>
            <div className="overflow-x-auto">
              <TabsList>
                <TabsTrigger value="identification">Identificacion</TabsTrigger>
                <TabsTrigger value="location" disabled={maxAllowedStep < 1}>
                  Ubicacion
                </TabsTrigger>
                <TabsTrigger value="conditions" disabled={maxAllowedStep < 2}>
                  Condiciones
                </TabsTrigger>
                <TabsTrigger value="cabinet" disabled={maxAllowedStep < 3}>
                  Gabinete
                </TabsTrigger>
                <TabsTrigger value="accessibility" disabled={maxAllowedStep < 4}>
                  Accesibilidad
                </TabsTrigger>
                <TabsTrigger value="signage" disabled={maxAllowedStep < 5}>
                  Senalizacion
                </TabsTrigger>
                <TabsTrigger value="observations" disabled={maxAllowedStep < 6}>
                  Observaciones
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="mt-4">
              <TabsContent value="identification">
                <IdentificationSection form={form} />
              </TabsContent>
              <TabsContent value="location">
                <LocationSection form={form} />
              </TabsContent>
              <TabsContent value="conditions">
                <ConditionsSection form={form} />
              </TabsContent>
              <TabsContent value="cabinet">
                <CabinetSection form={form} />
              </TabsContent>
              <TabsContent value="accessibility">
                <AccessibilitySection form={form} />
              </TabsContent>
              <TabsContent value="signage">
                <SignageSection form={form} />
              </TabsContent>
              <TabsContent value="observations">
                <ObservationsSection form={form} formError={formError} />
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </PageLayout>
  );
};

export default CreateEditFireExtinguisherPage;
