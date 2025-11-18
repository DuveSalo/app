
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SelfProtectionSystem } from '../../types/index';
import { ROUTE_PATHS, MOCK_COMPANY_ID } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FileUpload } from '../../components/common/FileUpload';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PdfPreview } from '../../components/common/PdfPreview';
import PageLayout from '../../components/layout/PageLayout';
import { Tabs } from '../../components/common/Tabs';
import { TrashIcon, EyeIcon } from '../../components/common/Icons';
import { createLogger } from '../../lib/utils/logger';

const logger = createLogger('CreateEditSelfProtectionSystemPage');

const CreateEditSelfProtectionSystemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [maxAllowedStep, setMaxAllowedStep] = useState(0);

  const initialSystemData: Omit<SelfProtectionSystem, 'id'|'companyId'> = {
    probatoryDispositionDate: undefined,
    probatoryDispositionPdf: undefined,
    probatoryDispositionPdfName: undefined,
    extensionDate: '',
    extensionPdf: undefined,
    extensionPdfName: undefined,
    expirationDate: '',
    drills: Array(4).fill(null).map(() => ({ date: '', pdfFile: undefined, pdfFileName: undefined })),
    intervener: '',
    registrationNumber: '',
  };
  const [currentFormData, setCurrentFormData] = useState<Omit<SelfProtectionSystem, 'id'|'companyId'>>(initialSystemData);

  const isPrincipalComplete = useMemo(() => !!currentFormData.probatoryDispositionDate, [currentFormData.probatoryDispositionDate]);
  const isSimulacrosComplete = useMemo(() => currentFormData.drills.every(drill => !!drill.date), [currentFormData.drills]);
  const isProfesionalComplete = useMemo(() => !!currentFormData.intervener && !!currentFormData.registrationNumber, [currentFormData.intervener, currentFormData.registrationNumber]);
  const isFormComplete = useMemo(() => isPrincipalComplete && isSimulacrosComplete && isProfesionalComplete, [isPrincipalComplete, isSimulacrosComplete, isProfesionalComplete]);

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
      api.getSelfProtectionSystemById(id)
        .then(systemToEdit => {
          setCurrentFormData({
            ...initialSystemData,
            ...systemToEdit,
            drills: systemToEdit.drills.length >= 4 ? systemToEdit.drills.slice(0,4) : Array(4).fill(null).map((_, i) => systemToEdit.drills[i] || ({ date: '', pdfFile: undefined, pdfFileName: undefined }))
          });
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Error al cargar datos del sistema.";
          setPageError(message);
        })
        .finally(() => setIsLoadingData(false));
    } else {
      setCurrentFormData(initialSystemData);
    }
  }, [id]);

  useEffect(() => {
    if (currentFormData.probatoryDispositionDate) {
        try {
            const baseDate = new Date(currentFormData.probatoryDispositionDate);
            baseDate.setMinutes(baseDate.getMinutes() + baseDate.getTimezoneOffset()); // Adjust to treat date as local

            const extensionDate = new Date(baseDate);
            extensionDate.setFullYear(baseDate.getFullYear() + 1);

            const expirationDate = new Date(baseDate);
            expirationDate.setFullYear(baseDate.getFullYear() + 2);
            
            setCurrentFormData(prev => ({
                ...prev,
                extensionDate: extensionDate.toISOString().split('T')[0],
                expirationDate: expirationDate.toISOString().split('T')[0],
            }));
        } catch(e) {
            logger.warn("Invalid date format for auto-calculation", { error: e, date: currentFormData.probatoryDispositionDate });
        }
    }
  }, [currentFormData.probatoryDispositionDate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (name: string, file: File | null) => {
     const currentNameKey = `${name}Name` as keyof typeof currentFormData;
     setCurrentFormData(prev => ({ 
        ...prev, 
        [name]: file || undefined, 
        [currentNameKey]: file?.name || prev[currentNameKey] 
    }));
  };

  const handleDrillChange = (index: number, field: 'date' | 'pdfFile', value: string | File | null) => {
    setCurrentFormData(prev => {
      const newDrills = [...prev.drills];
      const drillToUpdate = { ...newDrills[index] };

      if (field === 'date') {
        drillToUpdate.date = value as string;
      } else if (field === 'pdfFile') {
        const file = value as File | null;
        drillToUpdate.pdfFile = file || undefined;
        drillToUpdate.pdfFileName = file?.name || drillToUpdate.pdfFileName;
      }
      newDrills[index] = drillToUpdate;
      return { ...prev, drills: newDrills };
    });
  };

  const handleClearDrill = (index: number) => {
    setCurrentFormData(prev => {
      const newDrills = [...prev.drills];
      newDrills[index] = { date: '', pdfFile: undefined, pdfFileName: undefined };
      return { ...prev, drills: newDrills };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
      setFormError("Por favor, complete todos los campos requeridos en todas las secciones para guardar.");
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      if (id) {
        await api.updateSelfProtectionSystem({ ...currentFormData, id, companyId: MOCK_COMPANY_ID });
      } else {
        await api.createSelfProtectionSystem(currentFormData);
      }
      navigate(ROUTE_PATHS.SELF_PROTECTION_SYSTEMS);
    } catch (err: any) {
      setFormError((err as Error).message || "Error al guardar el sistema");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeTab < formTabs.length - 1) {
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
      case 0: // Principal
        return (
          <>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTE_PATHS.SELF_PROTECTION_SYSTEMS)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="button" onClick={handleNext} disabled={!isPrincipalComplete}>Siguiente</Button>
          </>
        );
      case 1: // Simulacros
        return (
          <>
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>Atrás</Button>
            <Button type="button" onClick={handleNext} disabled={!isSimulacrosComplete}>Siguiente</Button>
          </>
        );
      case 2: // Profesional
        return (
          <>
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>Atrás</Button>
            <Button type="submit" form="sps-form" loading={isSubmitting} variant="primary" disabled={!isFormComplete}>
              {id ? "Actualizar" : "Guardar"}
            </Button>
          </>
        );
      default:
        return null;
    }
  }, [activeTab, isSubmitting, isPrincipalComplete, isSimulacrosComplete, isFormComplete, id, navigate, handleNext, handleBack]);

  // Early returns for loading and error states
  if (isLoadingData) return <div className="flex-grow flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (pageError) return <div className="flex-grow flex justify-center items-center h-full"><p className="text-red-500 text-center py-10">{pageError}</p></div>;

  const pageTitle = id ? "Editar Sistema de Autoprotección" : "Nuevo Sistema de Autoprotección";

  const formTabs = [
    {
        label: 'Principal',
        disabled: false,
        content: (
            <div className="space-y-4">
                <Input id="probatoryDispositionDate" label="Fecha Disposición Aprobatoria" type="date" name="probatoryDispositionDate" value={currentFormData.probatoryDispositionDate || ''} onChange={handleChange} required/>

                {id && currentFormData.probatoryDispositionPdfUrl && !currentFormData.probatoryDispositionPdf && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">PDF actual:</p>
                        <p className="text-sm text-gray-600">{currentFormData.probatoryDispositionPdfName || 'Disposición Aprobatoria'}</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                        onClick={() => window.open(currentFormData.probatoryDispositionPdfUrl, '_blank')}
                        title="Ver PDF actual"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Ver PDF
                      </button>
                    </div>
                  </div>
                )}

                <FileUpload label={id ? "Reemplazar PDF Disposición Aprobatoria (opcional)" : "PDF Disposición Aprobatoria"} accept=".pdf" currentFileName={currentFormData.probatoryDispositionPdfName} onFileSelect={(file) => handleFileChange('probatoryDispositionPdf', file)} />
                <PdfPreview file={currentFormData.probatoryDispositionPdf} />

                <Input id="extensionDate" label="Fecha Extensión" type="date" name="extensionDate" value={currentFormData.extensionDate || ''} onChange={handleChange} disabled />

                {id && currentFormData.extensionPdfUrl && !currentFormData.extensionPdf && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">PDF actual:</p>
                        <p className="text-sm text-gray-600">{currentFormData.extensionPdfName || 'Extensión'}</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                        onClick={() => window.open(currentFormData.extensionPdfUrl, '_blank')}
                        title="Ver PDF actual"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Ver PDF
                      </button>
                    </div>
                  </div>
                )}

                <FileUpload label={id ? "Reemplazar PDF Extensión (opcional)" : "PDF Extensión"} accept=".pdf" currentFileName={currentFormData.extensionPdfName} onFileSelect={(file) => handleFileChange('extensionPdf', file)} />
                <PdfPreview file={currentFormData.extensionPdf} />

                <Input id="expirationDate" label="Fecha Vencimiento" type="date" name="expirationDate" value={currentFormData.expirationDate} onChange={handleChange} required disabled/>
            </div>
        )
    },
    {
        label: 'Simulacros',
        disabled: maxAllowedStep < 1,
        content: (
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Registre la información de los 4 simulacros requeridos. Se requiere la fecha de los 4 simulacros para continuar.</p>
                {currentFormData.drills.map((drill, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50/70">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-800">Simulacro {index + 1}</h4>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearDrill(index)}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1"
                            aria-label={`Limpiar Simulacro ${index + 1}`}
                        >
                            <TrashIcon className="w-4 h-4 mr-1.5" />
                            Limpiar
                        </Button>
                    </div>
                    <div className="space-y-3">
                      <Input label="Fecha" id={`drillDate-${index}`} type="date" value={drill.date} onChange={(e) => handleDrillChange(index, 'date', e.target.value)} required/>

                      {id && drill.pdfUrl && !drill.pdfFile && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">PDF actual:</p>
                              <p className="text-sm text-gray-600">{drill.pdfFileName || `Simulacro ${index + 1}`}</p>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                              onClick={() => window.open(drill.pdfUrl, '_blank')}
                              title="Ver PDF actual"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              Ver PDF
                            </button>
                          </div>
                        </div>
                      )}

                      <FileUpload label={id ? "Reemplazar PDF del Simulacro (opcional)" : "PDF del Simulacro"} accept=".pdf" currentFileName={drill.pdfFileName} onFileSelect={(file) => handleDrillChange(index, 'pdfFile', file)} />
                      <PdfPreview file={drill.pdfFile} />
                    </div>
                  </div>
                ))}
            </div>
        )
    },
    {
        label: 'Profesional',
        disabled: maxAllowedStep < 2,
        content: (
            <div className="space-y-4">
                <Input id="intervener" label="Personal Interviniente" name="intervener" value={currentFormData.intervener} onChange={handleChange} required />
                <Input id="registrationNumber" label="Matrícula" name="registrationNumber" value={currentFormData.registrationNumber} onChange={handleChange} required />
            </div>
        )
    }
  ];

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <form id="sps-form" onSubmit={handleSubmit}>
        <Tabs tabs={formTabs} activeTab={activeTab} onTabClick={setActiveTab} />
        {formError && <p className="text-sm text-red-500 mt-4 text-center">{formError}</p>}
      </form>
    </PageLayout>
  );
};

export default CreateEditSelfProtectionSystemPage;