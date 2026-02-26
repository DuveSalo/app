import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConservationCertificate } from '../../types/index';
import { ROUTE_PATHS, MOCK_COMPANY_ID } from '../../constants/index';
import * as api from '@/lib/api/services';
import { useToast } from '../../components/common/Toast';
import { validateDateRange, validateRequired } from '../../lib/utils/validation';
import { sanitizeInput } from '../../lib/utils/sanitize';
import { useEntityForm } from '../../lib/hooks/useEntityForm';
import { Input } from '../../components/common/Input';
import { DatePicker } from '../../components/common/DatePicker';
import { Button } from '../../components/common/Button';
import { FileUpload } from '../../components/common/FileUpload';
import { SkeletonForm } from '../../components/common/SkeletonLoader';
import { PdfPreview } from '../../components/common/PdfPreview';
import PageLayout from '../../components/layout/PageLayout';

const CreateEditConservationCertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const emptyCertificate: Omit<ConservationCertificate, 'id' | 'companyId'> = {
    presentationDate: '',
    expirationDate: '',
    intervener: '',
    registrationNumber: '',
    pdfFile: undefined,
    pdfFileName: undefined
  };

  const {
    data: currentFormData,
    setData: setCurrentFormData,
    isLoading: isLoadingData,
    fieldErrors,
    setFieldErrors,
    handleChange,
    handleFieldChange,
    isEditMode
  } = useEntityForm<Omit<ConservationCertificate, 'id' | 'companyId'>>({
    id,
    emptyData: emptyCertificate,
    fetchFn: api.getCertificateById,
    onError: showError,
    onNavigate: navigate,
    errorNavigationPath: ROUTE_PATHS.CONSERVATION_CERTIFICATES,
  });

  const handleFileChange = (file: File | null) => {
    handleFieldChange('pdfFile', file || undefined);
    handleFieldChange('pdfFileName', file?.name || currentFormData.pdfFileName);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const intervenerValidation = validateRequired(currentFormData.intervener, 'Personal Interviniente');
    if (!intervenerValidation.valid) errors.intervener = intervenerValidation.error!;

    const registrationValidation = validateRequired(currentFormData.registrationNumber, 'Matrícula');
    if (!registrationValidation.valid) errors.registrationNumber = registrationValidation.error!;

    const presentationValidation = validateRequired(currentFormData.presentationDate, 'Fecha de Presentación');
    if (!presentationValidation.valid) errors.presentationDate = presentationValidation.error!;

    const expirationValidation = validateRequired(currentFormData.expirationDate, 'Fecha de Vencimiento');
    if (!expirationValidation.valid) errors.expirationDate = expirationValidation.error!;

    if (currentFormData.presentationDate && currentFormData.expirationDate) {
      const dateRangeValidation = validateDateRange(
        currentFormData.presentationDate,
        currentFormData.expirationDate
      );
      if (!dateRangeValidation.valid) {
        errors.expirationDate = dateRangeValidation.error!;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor corrija los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...currentFormData,
        intervener: sanitizeInput(currentFormData.intervener),
        registrationNumber: sanitizeInput(currentFormData.registrationNumber),
      };

      if (id) {
        await api.updateCertificate({ ...dataToSubmit, id, companyId: MOCK_COMPANY_ID });
        showSuccess('Certificado actualizado correctamente');
      } else {
        await api.createCertificate(dataToSubmit);
        showSuccess('Certificado creado correctamente');
      }

      navigate(ROUTE_PATHS.CONSERVATION_CERTIFICATES);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Error al guardar certificado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <PageLayout title="Cargando...">
        <SkeletonForm />
      </PageLayout>
    );
  }

  const pageTitle = id ? "Editar Certificado de Conservación" : "Nuevo Certificado de Conservación";

  const footerActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(ROUTE_PATHS.CONSERVATION_CERTIFICATES)}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="certificate-form"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : (id ? "Actualizar" : "Guardar")}
      </Button>
    </>
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl space-y-6">
          <form id="certificate-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Fecha de Presentación"
                id="presentationDate"
                value={currentFormData.presentationDate}
                onChange={(value) => handleFieldChange('presentationDate', value)}
                error={fieldErrors.presentationDate}
                required
              />
              <DatePicker
                label="Fecha de Vencimiento"
                id="expirationDate"
                value={currentFormData.expirationDate}
                onChange={(value) => handleFieldChange('expirationDate', value)}
                error={fieldErrors.expirationDate}
                required
                minDate={currentFormData.presentationDate || undefined}
              />
            </div>

            <Input
              label="Personal Interviniente"
              id="intervener"
              name="intervener"
              value={currentFormData.intervener}
              onChange={handleChange}
              error={fieldErrors.intervener}
              placeholder="Ej: Juan Pérez"
              required
            />

            <Input
              label="Matrícula / Número de Registro"
              id="registrationNumber"
              name="registrationNumber"
              value={currentFormData.registrationNumber}
              onChange={handleChange}
              error={fieldErrors.registrationNumber}
              placeholder="Ej: 12345"
              required
            />

            <FileUpload
              label="Subir PDF del Certificado"
              accept=".pdf"
              currentFileName={currentFormData.pdfFileName}
              onFileSelect={handleFileChange}
            />

            <PdfPreview file={currentFormData.pdfFile} />
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateEditConservationCertificatePage;
