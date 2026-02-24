import { type Dispatch, type SetStateAction, type ChangeEvent } from 'react';
import { QRDocumentType } from '../../../types/index';
import { MODULE_TITLES } from '../../../constants/index';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { ChipGroup } from '../../../components/common/ChipGroup';
import { EditIcon } from '../../../components/common/Icons';
import type { CompanyFormData } from '../hooks/useSettingsData';
import type { Company } from '../../../types/index';

const serviceOptions = [
  { value: QRDocumentType.Elevators, label: MODULE_TITLES.QR_ELEVATORS },
  { value: QRDocumentType.WaterHeaters, label: MODULE_TITLES.QR_WATER_HEATERS },
  { value: QRDocumentType.FireSafetySystem, label: MODULE_TITLES.QR_FIRE_SAFETY },
  { value: QRDocumentType.DetectionSystem, label: MODULE_TITLES.QR_DETECTION },
];
const serviceLabelToValueMap = new Map(serviceOptions.map(o => [o.label, o.value]));
const serviceValueToLabelMap = new Map(serviceOptions.map(o => [o.value, o.label]));

interface CompanyInfoSectionProps {
  currentCompany: Company;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  companyForm: Partial<CompanyFormData>;
  setCompanyForm: Dispatch<SetStateAction<Partial<CompanyFormData>>>;
  companyFormErrors: Record<string, string>;
  handleCompanyFormChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error: string;
}

export const CompanyInfoSection = ({
  currentCompany,
  isEditing,
  setIsEditing,
  companyForm,
  setCompanyForm,
  companyFormErrors,
  handleCompanyFormChange,
  error,
}: CompanyInfoSectionProps) => {
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-semibold text-gray-900">Información de la empresa</h2>
        </div>
        <div className="space-y-4">
          <Input id="companyName" label="Nombre de la empresa" name="name" value={companyForm.name || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.name} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="companyCuit" label="CUIT" name="cuit" value={companyForm.cuit || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.cuit} maxLength={13} />
            <Input id="companyPostalCode" label="Código Postal" name="postalCode" value={companyForm.postalCode || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.postalCode} />
          </div>
          <Input id="companyAddress" label="Dirección" name="address" value={companyForm.address || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.address} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input id="companyCity" label="Ciudad" name="city" value={companyForm.city || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.city} />
            <Input id="companyProvince" label="Provincia" name="province" value={companyForm.province || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.province} />
            <Input id="companyCountry" label="País" name="country" value={companyForm.country || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.country} />
          </div>
        </div>
        <div className="pt-2">
          <ChipGroup
            label="Servicios Requeridos"
            options={serviceOptions.map(o => o.label)}
            selectedOptions={(companyForm.services || []).map(v => serviceValueToLabelMap.get(v)!)}
            onChange={(selectedLabels) => {
              const newValues = selectedLabels.map(label => serviceLabelToValueMap.get(label)!);
              setCompanyForm(prev => ({ ...prev, services: newValues }));
            }}
          />
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900">Información de la empresa</h2>
        <Button type="button" onClick={() => setIsEditing(true)}>
          <EditIcon className="w-4 h-4 mr-2" />
          Editar información
        </Button>
      </div>
      <Card>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nombre de la empresa</p>
            <p className="text-sm text-gray-900">{currentCompany.name}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CUIT</p>
              <p className="text-sm text-gray-900">{currentCompany.cuit}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Código Postal</p>
              <p className="text-sm text-gray-900">{currentCompany.postalCode}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dirección</p>
            <p className="text-sm text-gray-900">{currentCompany.address}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Ciudad</p>
              <p className="text-sm text-gray-900">{currentCompany.city}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Provincia</p>
              <p className="text-sm text-gray-900">{currentCompany.province}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">País</p>
              <p className="text-sm text-gray-900">{currentCompany.country}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Servicios Contratados</p>
            <div className="flex flex-wrap gap-2">
              {currentCompany.services && Object.entries(currentCompany.services).filter(([_, enabled]) => enabled).map(([service]) => (
                <span key={service} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {serviceValueToLabelMap.get(service as QRDocumentType)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
