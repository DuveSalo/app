import { Input } from '../../../components/common/Input';
import { DatePicker } from '../../../components/common/DatePicker';
import { Select } from '../../../components/common/Select';
import { ExtinguisherType, ExtinguisherCapacity } from '../../../types/index';
import { SectionProps } from '../types';

export const IdentificationSection = ({ formData, onChange, onFieldChange }: SectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePicker
          label="Fecha de Control"
          id="controlDate"
          value={formData.controlDate}
          onChange={(value) => onFieldChange?.('controlDate', value)}
          required
        />
        <Input
          label="Numero de Extintor"
          id="extinguisherNumber"
          type="text"
          name="extinguisherNumber"
          value={formData.extinguisherNumber}
          onChange={onChange}
          placeholder="Ej: EXT-001"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Tipo"
          id="type"
          name="type"
          value={formData.type}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          {Object.values(ExtinguisherType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
        <Select
          label="Capacidad"
          id="capacity"
          name="capacity"
          value={formData.capacity}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          {Object.values(ExtinguisherCapacity).map(cap => (
            <option key={cap} value={cap}>{cap} kg</option>
          ))}
        </Select>
        <Input
          label="Clase"
          id="class"
          type="text"
          name="class"
          value={formData.class}
          onChange={onChange}
          placeholder="Ej: ABC"
          required
        />
      </div>
    </div>
  );
};
