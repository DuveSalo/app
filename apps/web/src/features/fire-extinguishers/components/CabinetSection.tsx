import { Select } from '../../../components/common/Select';
import { SectionProps } from '../types';

export const CabinetSection = ({ formData, onChange }: SectionProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm font-light text-neutral-500">Indique el estado del gabinete donde se encuentra el extintor.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="El vidrio esta en condiciones?"
          id="glassCondition"
          name="glassCondition"
          value={formData.glassCondition}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="N/A">N/A</option>
        </Select>
        <Select
          label="La puerta se abre sin dificultad?"
          id="doorOpensEasily"
          name="doorOpensEasily"
          value={formData.doorOpensEasily}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="N/A">N/A</option>
        </Select>
        <Select
          label="El gabinete esta limpio?"
          id="cabinetClean"
          name="cabinetClean"
          value={formData.cabinetClean}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="N/A">N/A</option>
        </Select>
      </div>
    </div>
  );
};
