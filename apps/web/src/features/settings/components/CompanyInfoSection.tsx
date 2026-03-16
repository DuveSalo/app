import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QRDocumentType } from '../../../types/index';
import { MODULE_TITLES } from '../../../constants/index';
import { Button } from '@/components/ui/button';
import { Input } from '../../../components/common/Input';
import { ChipGroup } from '../../../components/common/ChipGroup';
import { EditIcon } from '../../../components/common/Icons';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { companyInfoSchema, type CompanyInfoFormValues } from '../schemas';
import type { Company } from '../../../types/index';

const serviceOptions = [
  { value: QRDocumentType.Elevators, label: MODULE_TITLES.QR_ELEVATORS },
  { value: QRDocumentType.WaterHeaters, label: MODULE_TITLES.QR_WATER_HEATERS },
  { value: QRDocumentType.FireSafetySystem, label: MODULE_TITLES.QR_FIRE_SAFETY },
  { value: QRDocumentType.DetectionSystem, label: MODULE_TITLES.QR_DETECTION },
];
const serviceLabelToValueMap: Map<string, QRDocumentType> = new Map(
  serviceOptions.map((o) => [o.label, o.value])
);
const serviceValueToLabelMap: Map<string, string> = new Map(
  serviceOptions.map((o) => [o.value, o.label])
);

function companyToFormValues(company: Company): CompanyInfoFormValues {
  return {
    name: company.name,
    cuit: company.cuit,
    address: company.address,
    postalCode: company.postalCode,
    city: company.city,
    province: company.province,
    phone: company.phone || '',
    country: company.country,
    services: company.services
      ? (Object.keys(company.services) as QRDocumentType[]).filter(
          (key) => company.services?.[key]
        )
      : [],
  };
}

interface CompanyInfoSectionProps {
  currentCompany: Company;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  onSubmit: (values: CompanyInfoFormValues) => void;
  isLoading: boolean;
  error: string;
  onCancel: () => void;
}

export const CompanyInfoSection = ({
  currentCompany,
  isEditing,
  setIsEditing,
  onSubmit,
  isLoading,
  error,
  onCancel,
}: CompanyInfoSectionProps) => {
  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    mode: 'onBlur',
    defaultValues: companyToFormValues(currentCompany),
  });

  // Reset form when entering edit mode or when company data changes
  useEffect(() => {
    form.reset(companyToFormValues(currentCompany));
  }, [currentCompany, form]);

  const handleEdit = () => {
    form.reset(companyToFormValues(currentCompany));
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset(companyToFormValues(currentCompany));
    onCancel();
  };

  // Format CUIT as user types: XX-XXXXXXXX-X
  const formatCuit = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
  };

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-medium text-foreground">Informacion de la empresa</h2>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la empresa</FormLabel>
                  <FormControl>
                    <Input id="companyName" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input id="companyPhone" placeholder="011 4567-8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cuit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CUIT</FormLabel>
                    <FormControl>
                      <Input
                        id="companyCuit"
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
                  <FormItem>
                    <FormLabel>Codigo Postal</FormLabel>
                    <FormControl>
                      <Input id="companyPostalCode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direccion</FormLabel>
                  <FormControl>
                    <Input id="companyAddress" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input id="companyCity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia</FormLabel>
                    <FormControl>
                      <Input id="companyProvince" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pais</FormLabel>
                    <FormControl>
                      <Input id="companyCountry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="pt-2">
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <ChipGroup
                    label="Servicios Requeridos"
                    options={serviceOptions.map((o) => o.label)}
                    selectedOptions={field.value.map((v) => serviceValueToLabelMap.get(v)!)}
                    onChange={(selectedLabels) => {
                      const newValues = selectedLabels.map(
                        (label) => serviceLabelToValueMap.get(label)!
                      ) as QRDocumentType[];
                      field.onChange(newValues);
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-medium text-foreground">Informacion de la empresa</h2>
        <Button type="button" onClick={handleEdit}>
          <EditIcon className="w-4 h-4 mr-2" />
          Editar informacion
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Nombre de la empresa</p>
          <p className="text-sm text-foreground">{currentCompany.name}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Teléfono</p>
            <p className="text-sm text-foreground">{currentCompany.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">CUIT</p>
            <p className="text-sm text-foreground">{currentCompany.cuit}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Codigo Postal</p>
            <p className="text-sm text-foreground">{currentCompany.postalCode}</p>
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground mb-1">Direccion</p>
          <p className="text-sm text-foreground">{currentCompany.address}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Ciudad</p>
            <p className="text-sm text-foreground">{currentCompany.city}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Provincia</p>
            <p className="text-sm text-foreground">{currentCompany.province}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Pais</p>
            <p className="text-sm text-foreground">{currentCompany.country}</p>
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground mb-3">Servicios Contratados</p>
          <div className="flex flex-wrap gap-2">
            {currentCompany.services &&
              Object.entries(currentCompany.services)
                .filter(([_, enabled]) => enabled)
                .map(([service]) => (
                  <span
                    key={service}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-muted text-foreground border border-border"
                  >
                    {serviceValueToLabelMap.get(service as QRDocumentType)}
                  </span>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};
