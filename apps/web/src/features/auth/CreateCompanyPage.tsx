import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth/AuthContext';
import { QRDocumentType } from '../../types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import {
  COUNTRIES,
  PROVINCES_BY_COUNTRY,
  CITIES_BY_PROVINCE,
  isCabaProvince,
} from '../../constants/geographic-data';
import { createCompanySchema, type CreateCompanyFormValues } from './schemas';

/** Auto-format raw digits into XX-XXXXXXXX-X CUIT pattern */
function formatCuit(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
}

const CreateCompanyPage = () => {
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { setPendingCompanyData } = useAuth();
  const navigate = useNavigate();

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      cuit: '',
      address: '',
      postalCode: '',
      city: '',
      province: '',
      country: 'Argentina',
      phone: '',
      services: [],
    },
  });

  const country = form.watch('country');
  const province = form.watch('province');
  const services = form.watch('services');

  const availableProvinces = useMemo(() => PROVINCES_BY_COUNTRY[country] || [], [country]);
  const availableCities = useMemo(() => CITIES_BY_PROVINCE[province] || [], [province]);
  const isCabaSelected = isCabaProvince(province);

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
    {
      value: QRDocumentType.ElectricalInstallations,
      label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS,
    },
  ];

  const toggleService = (service: QRDocumentType) => {
    const current = form.getValues('services');
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    form.setValue('services', updated);
  };

  const onSubmit = (values: CreateCompanyFormValues) => {
    setError('');
    setPendingCompanyData({
      name: values.name,
      cuit: values.cuit,
      address: values.address,
      postalCode: values.postalCode,
      city: isCabaProvince(values.province) ? '' : values.city,
      province: values.province,
      country: values.country,
      locality: '',
      ramaKey: 'N/A',
      ownerEntity: 'N/A',
      phone: values.phone,
      paymentMethod: null,
      services: (values.services as QRDocumentType[]).reduce(
        (acc, s) => {
          acc[s] = true;
          return acc;
        },
        {} as { [key in QRDocumentType]?: boolean }
      ),
    });
    navigate(ROUTE_PATHS.SUBSCRIPTION);
  };

  const wizardSteps = ['Crear Cuenta', 'Registrar Escuela', 'Suscripción'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={2}>
      {showSuccessMessage && (
        <div className="mb-3 w-full max-w-[860px] rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-600">
            ¡Email confirmado! Ahora completá los datos de tu escuela.
          </p>
        </div>
      )}

      <Card className="w-full max-w-[860px] gap-4 py-4">
        <CardContent className="p-6 sm:p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Registrar Escuela
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ingresá la información de tu institución.
                </p>
              </div>

              <div className="flex flex-col gap-3.5">
                {/* Company name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Institución</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Escuela N° 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CUIT + Postal Code row */}
                <div className="flex flex-col gap-3.5 md:flex-row">
                  <FormField
                    control={form.control}
                    name="cuit"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>CUIT</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="30-12345678-9"
                            maxLength={13}
                            {...field}
                            onChange={(e) => {
                              field.onChange(formatCuit(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1425"
                            maxLength={8}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value.replace(/\D/g, ''));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Country + Province row */}
                <div className="flex flex-col gap-3.5 md:flex-row">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>País</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('province', '');
                            form.setValue('city', '', { shouldValidate: true });
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRIES.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Provincia</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('city', '', { shouldValidate: true });
                          }}
                          value={field.value}
                          disabled={!country}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableProvinces.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* City + Phone row */}
                <div className={`flex flex-col gap-3.5 ${isCabaSelected ? '' : 'md:flex-row'}`}>
                  {!isCabaSelected && (
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Ciudad</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!province}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableCities.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="011 4567-8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Av. del Libertador 5252" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-px bg-border" />

              {/* Services */}
              <div className="flex flex-col gap-2.5">
                <FormLabel>Servicios Requeridos</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((opt) => {
                    const isSelected = services.includes(opt.value);
                    return (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => toggleService(opt.value)}
                        className="h-8 px-3 text-xs sm:text-sm"
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                >
                  &larr; Volver
                </Button>
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default CreateCompanyPage;
