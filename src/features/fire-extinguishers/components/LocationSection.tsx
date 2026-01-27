import React from 'react';
import { Input } from '../../../components/common/Input';
import { SectionProps } from '../types';

export const LocationSection: React.FC<SectionProps> = ({ formData, onChange }) => {
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
      <Input
        label="Vencimiento de Vigencia de la Carga"
        id="chargeExpirationDate"
        type="date"
        name="chargeExpirationDate"
        value={formData.chargeExpirationDate}
        onChange={onChange}
        required
      />
      <Input
        label="Vencimiento de Vigencia de la Presión Hidráulica"
        id="hydraulicPressureExpirationDate"
        type="date"
        name="hydraulicPressureExpirationDate"
        value={formData.hydraulicPressureExpirationDate}
        onChange={onChange}
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
