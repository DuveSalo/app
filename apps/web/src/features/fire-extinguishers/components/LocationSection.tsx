import { Input } from '../../../components/common/Input';
import { DatePicker } from '../../../components/common/DatePicker';
import { SectionProps } from '../types';

export const LocationSection = ({ formData, onChange, onFieldChange }: SectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Numero de Puesto"
          id="positionNumber"
          type="text"
          name="positionNumber"
          value={formData.positionNumber}
          onChange={onChange}
          placeholder="Ej: P-01"
          required
        />
        <Input
          label="Ano de Fabricacion"
          id="manufacturingYear"
          type="text"
          name="manufacturingYear"
          value={formData.manufacturingYear}
          onChange={onChange}
          placeholder="Ej: 2023"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePicker
          label="Vencimiento de Carga"
          id="chargeExpirationDate"
          value={formData.chargeExpirationDate}
          onChange={(value) => onFieldChange?.('chargeExpirationDate', value)}
          required
        />
        <DatePicker
          label="Vencimiento Presion Hidraulica"
          id="hydraulicPressureExpirationDate"
          value={formData.hydraulicPressureExpirationDate}
          onChange={(value) => onFieldChange?.('hydraulicPressureExpirationDate', value)}
          required
        />
      </div>
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
