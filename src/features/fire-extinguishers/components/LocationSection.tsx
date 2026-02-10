import React from 'react';
import { Input } from '../../../components/common/Input';
import { DatePicker } from '../../../components/common/DatePicker';
import { SectionProps } from '../types';

export const LocationSection: React.FC<SectionProps> = ({ formData, onChange, onFieldChange }) => {
  return (
    <div className="space-y-4">
      <Input
        label="Número de Puesto"
        id="positionNumber"
        type="text"
        name="positionNumber"
        value={formData.positionNumber}
        onChange={onChange}
        placeholder="Ej: P-01"
        required
      />
      <DatePicker
        label="Vencimiento de Vigencia de la Carga"
        id="chargeExpirationDate"
        value={formData.chargeExpirationDate}
        onChange={(value) => onFieldChange?.('chargeExpirationDate', value)}
        required
      />
      <DatePicker
        label="Vencimiento de Vigencia de la Presión Hidráulica"
        id="hydraulicPressureExpirationDate"
        value={formData.hydraulicPressureExpirationDate}
        onChange={(value) => onFieldChange?.('hydraulicPressureExpirationDate', value)}
        required
      />
      <Input
        label="Año de Fabricación"
        id="manufacturingYear"
        type="text"
        name="manufacturingYear"
        value={formData.manufacturingYear}
        onChange={onChange}
        placeholder="Ej: 2023"
        required
      />
      <Input
        label="Color de Marbete"
        id="tagColor"
        type="text"
        name="tagColor"
        value={formData.tagColor}
        onChange={onChange}
        placeholder="Ej: Rojo"
        required
      />
    </div>
  );
};
