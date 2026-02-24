import { Select } from '../../../components/common/Select';
import { SectionProps } from '../types';

export const AccessibilitySection = ({ formData, onChange }: SectionProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Verifique la accesibilidad del extintor.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="¿Está obstruida su visibilidad?"
          id="visibilityObstructed"
          name="visibilityObstructed"
          value={formData.visibilityObstructed}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </Select>
        <Select
          label="¿Está obstruido su acceso?"
          id="accessObstructed"
          name="accessObstructed"
          value={formData.accessObstructed}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </Select>
      </div>
    </div>
  );
};
