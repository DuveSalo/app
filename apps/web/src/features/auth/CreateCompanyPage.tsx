import { useState, useMemo, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import * as api from '@/lib/api/services';
import { Company, QRDocumentType } from '../../types/index';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import { COUNTRIES, PROVINCES_BY_COUNTRY, CITIES_BY_PROVINCE } from '../../constants/geographic-data';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedServices, setSelectedServices] = useState<QRDocumentType[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { setCompany } = useAuth();
  const navigate = useNavigate();

  const availableProvinces = useMemo(() => PROVINCES_BY_COUNTRY[formData.country] || [], [formData.country]);
  const availableCities = useMemo(() => CITIES_BY_PROVINCE[formData.province] || [], [formData.province]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('access_token') && urlParams.get('type') === 'signup') {
      setShowSuccessMessage(true);
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

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name': return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(value) ? '' : 'Solo se permiten letras y espacios.';
      case 'cuit': return /^\d{2}-\d{8}-\d{1}$/.test(value) ? '' : 'Formato invalido. Use XX-XXXXXXXX-X.';
      case 'postalCode': return /^\d{4,8}$/.test(value) ? '' : 'Entre 4 y 8 digitos.';
      default: return '';
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'cuit') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) finalValue = digits;
      else if (digits.length <= 10) finalValue = `${digits.slice(0, 2)}-${digits.slice(2)}`;
      else finalValue = `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
    } else if (name === 'postalCode') {
      finalValue = value.replace(/\D/g, '');
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    setFormErrors(prev => ({ ...prev, [name]: validateField(name, finalValue) }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'country') setFormData(prev => ({ ...prev, country: value, province: '', city: '' }));
    else if (name === 'province') setFormData(prev => ({ ...prev, province: value, city: '' }));
    else setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleService = (service: QRDocumentType) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const isFormValid = () => {
    return Object.values(formErrors).every(e => !e) && formData.name && formData.cuit && formData.address && formData.postalCode && formData.province && formData.country;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isFormValid()) { setError('Complete todos los campos requeridos.'); return; }
    setIsLoading(true);
    try {
      const apiData: Omit<Company, 'id' | 'userId' | 'employees' | 'isSubscribed' | 'selectedPlan'> = {
        ...formData,
        locality: formData.city,
        ramaKey: 'N/A',
        ownerEntity: 'N/A',
        phone: 'N/A',
        services: selectedServices.reduce((acc, s) => { acc[s] = true; return acc; }, {} as { [key in QRDocumentType]?: boolean }),
      };
      const newCompany = await api.createCompany(apiData);
      setCompany(newCompany);
      navigate(ROUTE_PATHS.SUBSCRIPTION);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la empresa.');
    } finally {
      setIsLoading(false);
    }
  };

  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripcion'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={2}>
      {showSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-4 max-w-[680px] w-full">
          <p className="text-sm font-medium text-emerald-600">
            Email confirmado! Ahora complete los datos de su empresa.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-neutral-200 rounded-md flex flex-col w-full max-w-[680px] p-10 gap-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium text-neutral-900">
            Datos de la Empresa
          </h2>
          <p className="text-sm font-light text-neutral-500">
            Ingresa la informacion de tu institucion.
          </p>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-900">Nombre de la Institucion</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="Ej: Escuela N 5"
              className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            {formErrors.name && <span className="text-xs text-red-600">{formErrors.name}</span>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-900">CUIT</label>
              <input
                type="text" name="cuit" value={formData.cuit} onChange={handleChange}
                placeholder="30-12345678-9" maxLength={13}
                className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              {formErrors.cuit && <span className="text-xs text-red-600">{formErrors.cuit}</span>}
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-900">Codigo Postal</label>
              <input
                type="text" name="postalCode" value={formData.postalCode} onChange={handleChange}
                placeholder="1425" maxLength={8}
                className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              {formErrors.postalCode && <span className="text-xs text-red-600">{formErrors.postalCode}</span>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-900">Pais</label>
              <select
                name="country" value={formData.country} onChange={handleSelectChange}
                className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Seleccione</option>
                {COUNTRIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-900">Provincia</label>
              <select
                name="province" value={formData.province} onChange={handleSelectChange}
                disabled={!formData.country}
                className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md bg-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Seleccione</option>
                {availableProvinces.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-900">Direccion</label>
            <input
              type="text" name="address" value={formData.address} onChange={handleChange}
              placeholder="Av. del Libertador 5252"
              className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            {formErrors.address && <span className="text-xs text-red-600">{formErrors.address}</span>}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-200" />

        {/* Services chips */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-neutral-900">Servicios Requeridos</label>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map((opt) => {
              const isSelected = selectedServices.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleService(opt.value)}
                  className={`flex items-center px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white'
                      : 'bg-transparent text-neutral-900 border border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.REGISTER)}
            className="text-sm font-light text-neutral-500 focus:outline-none"
          >
            &larr; Volver
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 focus:outline-none hover:bg-neutral-800"
          >
            {isLoading ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default CreateCompanyPage;
