
import { useState, useMemo, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import * as api from '@/lib/api/services';
import { Company, QRDocumentType } from '../../types/index';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { ChipGroup } from '../../components/common/ChipGroup';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import { COUNTRIES, PROVINCES_BY_COUNTRY, CITIES_BY_PROVINCE } from '../../constants/geographic-data';
import { CheckCircleIcon } from '../../components/common/Icons';

const CreateCompanyPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    cuit: '',
    address: '',
    postalCode: '',
    city: '',
    province: '',
    country: 'Argentina',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    cuit: '',
    address: '',
    postalCode: '',
    city: '',
    province: '',
    country: '',
  });

  const [selectedServices, setSelectedServices] = useState<QRDocumentType[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { setCompany } = useAuth();
  const navigate = useNavigate();

  // Get available provinces based on selected country
  const availableProvinces = useMemo(() => {
    return PROVINCES_BY_COUNTRY[formData.country] || [];
  }, [formData.country]);

  // Get available cities based on selected province
  const availableCities = useMemo(() => {
    return CITIES_BY_PROVINCE[formData.province] || [];
  }, [formData.province]);

  // Check if user was just confirmed (coming from email confirmation)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const type = urlParams.get('type');

    if (accessToken && type === 'signup') {
      setShowSuccessMessage(true);
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const serviceOptions = [
    { value: QRDocumentType.Elevators, label: MODULE_TITLES.QR_ELEVATORS },
    { value: QRDocumentType.WaterHeaters, label: MODULE_TITLES.QR_WATER_HEATERS },
    { value: QRDocumentType.FireSafetySystem, label: MODULE_TITLES.QR_FIRE_SAFETY },
    { value: QRDocumentType.DetectionSystem, label: MODULE_TITLES.QR_DETECTION },
    { value: QRDocumentType.ElectricalInstallations, label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS },
  ];
  const serviceLabelToValueMap = new Map<string, QRDocumentType>(serviceOptions.map(o => [o.label, o.value]));
  const serviceValueToLabelMap = new Map<QRDocumentType, string>(serviceOptions.map(o => [o.value, o.label]));

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(value) ? '' : 'Solo se permiten letras y espacios.';
      case 'cuit':
        return /^\d{2}-\d{8}-\d{1}$/.test(value) ? '' : 'Formato de CUIT inválido. Use XX-XXXXXXXX-X.';
      case 'postalCode':
        return /^\d{4,8}$/.test(value) ? '' : 'El código postal debe tener entre 4 y 8 dígitos.';
      case 'country':
      case 'province':
      case 'city':
        // These are select fields, no validation needed beyond required check
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'cuit') {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 2) {
            finalValue = digits;
        } else if (digits.length <= 10) {
            finalValue = `${digits.slice(0, 2)}-${digits.slice(2)}`;
        } else {
            finalValue = `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
        }
    } else if (name === 'postalCode') {
        finalValue = value.replace(/\D/g, '');
    }

    setFormData({ ...formData, [name]: finalValue });

    const errorMsg = validateField(name, finalValue);
    setFormErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    // When country changes, reset province and city
    if (name === 'country') {
      setFormData(prev => ({ ...prev, country: value, province: '', city: '' }));
      setFormErrors(prev => ({ ...prev, country: '', province: '', city: '' }));
    }
    // When province changes, reset city
    else if (name === 'province') {
      setFormData(prev => ({ ...prev, province: value, city: '' }));
      setFormErrors(prev => ({ ...prev, province: '', city: '' }));
    }
    // City change
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleServiceChange = (selectedLabels: string[]) => {
    const newSelectedServices = selectedLabels
      .map(label => serviceLabelToValueMap.get(label))
      .filter((v): v is QRDocumentType => v !== undefined);
    setSelectedServices(newSelectedServices);
  };

  const isFormValid = () => {
    const allFieldsValid = Object.values(formErrors).every(error => error === '');
    const allRequiredFieldsFilled = formData.name && formData.cuit && formData.address && formData.postalCode && formData.city && formData.province && formData.country;
    return allFieldsValid && !!allRequiredFieldsFilled;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
        setError("Por favor, complete todos los campos requeridos correctamente.");
        // Trigger validation for all fields to show errors
        const newErrors: Partial<typeof formErrors> = {};
        for (const key of Object.keys(formData)) {
            const fieldKey = key as keyof typeof formData;
            const error = validateField(key, formData[fieldKey]);
            if (error) newErrors[fieldKey] = error;
        }
        setFormErrors(prev => ({...prev, ...newErrors}));
        return;
    }

    setIsLoading(true);
    try {
      const apiCompanyData: Omit<Company, 'id' | 'userId' | 'employees' | 'isSubscribed' | 'selectedPlan'> = {
          ...formData,
          locality: formData.city,
          ramaKey: 'N/A',
          ownerEntity: 'N/A',
          phone: 'N/A',
          services: selectedServices.reduce((acc, service) => {
            acc[service] = true;
            return acc;
          }, {} as { [key in QRDocumentType]?: boolean }),
      };
      const newCompany = await api.createCompany(apiCompanyData);
      setCompany(newCompany);
      navigate(ROUTE_PATHS.SUBSCRIPTION);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear la empresa.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripcion'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={2}>
      <div className="max-w-3xl mx-auto w-full">
        {showSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-4 flex items-start" role="alert">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">¡Email Confirmado Exitosamente!</p>
              <p className="text-sm text-emerald-700 mt-0.5">Ahora puede continuar configurando su empresa.</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Datos de la Empresa</h2>
              <p className="text-gray-500 mt-1 text-sm">Complete esta información para configurar su cuenta. Podrá editarla más tarde.</p>
            </div>

            <div className="space-y-3">
              <Input label="Nombre de la institución" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Consorcio Edificio Central" required error={formErrors.name} />
              <div className="grid md:grid-cols-2 gap-3">
                  <Input label="CUIT" id="cuit" name="cuit" value={formData.cuit} onChange={handleChange} placeholder="Ej: 30-12345678-9" required error={formErrors.cuit} maxLength={13} />
                  <Input label="Código Postal" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Ej: 1425" required error={formErrors.postalCode} maxLength={8} />
              </div>

              {/* Location fields: Country -> Province -> City -> Address */}
              <div className="grid md:grid-cols-3 gap-3">
                  <Select
                    label="País"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleSelectChange}
                    options={COUNTRIES}
                    placeholder="Seleccione un país"
                    error={formErrors.country}
                  />
                  <Select
                    label="Provincia"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleSelectChange}
                    options={availableProvinces}
                    placeholder="Seleccione una provincia"
                    disabled={!formData.country}
                    error={formErrors.province}
                  />
                  <Select
                    label="Ciudad"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleSelectChange}
                    options={availableCities}
                    placeholder="Seleccione una ciudad"
                    disabled={!formData.province}
                    error={formErrors.city}
                  />
              </div>
              <Input label="Dirección" id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ej: Av. del Libertador 5252" required error={formErrors.address} />
            </div>

            <div className="pt-3 border-t border-gray-200">
                <ChipGroup
                    label="Servicios Requeridos"
                    options={serviceOptions.map(o => o.label)}
                    selectedOptions={selectedServices.map(v => serviceValueToLabelMap.get(v)!)}
                    onChange={handleServiceChange}
                />
                 <p className="text-xs text-gray-500 mt-1">Seleccione los servicios que aplican a su institución para habilitar los módulos correspondientes.</p>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                disabled={isLoading}
              >
                Volver
              </Button>
              <Button type="submit" loading={isLoading} size="lg" className="w-full sm:w-auto" disabled={isLoading || !isFormValid()}>
                Continuar
              </Button>
            </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default CreateCompanyPage;