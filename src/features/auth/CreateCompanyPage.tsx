
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import * as api from '../../lib/api/supabaseApi';
import { Company, QRDocumentType } from '../../types/index';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ChipGroup } from '../../components/common/ChipGroup';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import { CheckCircleIcon } from '../../components/common/Icons';

const CreateCompanyPage: React.FC = () => {
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
  const { setCompany, currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if user was just confirmed (coming from email confirmation)
  React.useEffect(() => {
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
  const serviceLabelToValueMap = new Map(serviceOptions.map(o => [o.label, o.value]));
  const serviceValueToLabelMap = new Map(serviceOptions.map(o => [o.value, o.label]));

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
      case 'city':
      case 'province':
      case 'country':
        return /^[a-zA-Z\s'-]+$/.test(value) ? '' : 'Solo se permiten letras y espacios.';
      case 'cuit':
        return /^\d{2}-\d{8}-\d{1}$/.test(value) ? '' : 'Formato de CUIT inválido. Use XX-XXXXXXXX-X.';
      case 'postalCode':
        return /^\d{4,8}$/.test(value) ? '' : 'El código postal debe tener entre 4 y 8 dígitos.';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const handleServiceChange = (selectedLabels: string[]) => {
    const newSelectedServices = selectedLabels.map(label => serviceLabelToValueMap.get(label)!);
    setSelectedServices(newSelectedServices);
  };

  const isFormValid = () => {
    const allFieldsValid = Object.values(formErrors).every(error => error === '');
    const allRequiredFieldsFilled = formData.name && formData.cuit && formData.address && formData.postalCode && formData.city && formData.province && formData.country;
    return allFieldsValid && !!allRequiredFieldsFilled;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
        setError("Por favor, complete todos los campos requeridos correctamente.");
        // Trigger validation for all fields to show errors
        const newErrors = Object.keys(formData).reduce((acc, key) => {
            const fieldKey = key as keyof typeof formData;
            const error = validateField(fieldKey, formData[fieldKey]);
            if(error) acc[fieldKey] = error;
            return acc;
        }, {} as typeof formErrors);
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
  
  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripción'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={2}>
      <div className="max-w-3xl mx-auto w-full">
        {showSuccessMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-900 p-3 rounded-md mb-4 flex items-start" role="alert">
            <CheckCircleIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-green-600" />
            <div>
              <p className="font-bold text-sm">¡Email Confirmado Exitosamente!</p>
              <p className="text-xs">Ahora puede continuar configurando su empresa.</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">Datos de la Empresa</h2>
              <p className="text-gray-500 mt-0.5 text-xs">Complete esta información para configurar su cuenta. Podrá editarla más tarde.</p>
            </div>

            <div className="space-y-3">
              <Input label="Nombre de la institución" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Consorcio Edificio Central" required error={formErrors.name} />
              <div className="grid md:grid-cols-2 gap-3">
                  <Input label="CUIT" id="cuit" name="cuit" value={formData.cuit} onChange={handleChange} placeholder="Ej: 30-12345678-9" required error={formErrors.cuit} maxLength={13} />
                  <Input label="Código Postal" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Ej: 1425" required error={formErrors.postalCode} maxLength={8} />
              </div>
              <Input label="Dirección" id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ej: Av. del Libertador 5252" required error={formErrors.address} />
              <div className="grid md:grid-cols-3 gap-3">
                  <Input label="Ciudad" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Ej: CABA" required error={formErrors.city} />
                  <Input label="Provincia" id="province" name="province" value={formData.province} onChange={handleChange} placeholder="Ej: Buenos Aires" required error={formErrors.province} />
                  <Input label="País" id="country" name="country" value={formData.country} onChange={handleChange} required error={formErrors.country} />
              </div>
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
                Continuar a Suscripción
              </Button>
            </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default CreateCompanyPage;