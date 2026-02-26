import { Select } from '../../../components/common/Select';
import { SectionProps } from '../types';

export const AccessibilitySection = ({ formData, onChange }: SectionProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm font-light text-neutral-500">Verifique la accesibilidad del extintor.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Esta obstruida su visibilidad?"
          id="visibilityObstructed"
          name="visibilityObstructed"
          value={formData.visibilityObstructed}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </Select>
        <Select
          label="Esta obstruido su acceso?"
          id="accessObstructed"
          name="accessObstructed"
          value={formData.accessObstructed}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </Select>
      </div>
    </div>
  );
};
