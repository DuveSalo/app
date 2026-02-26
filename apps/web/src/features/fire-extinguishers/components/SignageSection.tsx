import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { SectionProps } from '../types';

export const SignageSection = ({ formData, onChange }: SectionProps) => {
  return (
    <div className="space-y-4">
      <Textarea
        label="Estado y Conservacion"
        id="signageCondition"
        name="signageCondition"
        value={formData.signageCondition}
        onChange={onChange}
        placeholder="Describa el estado y conservacion de la senalizacion del extintor"
        rows={3}
        required
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Posee en el piso?"
          id="signageFloor"
          name="signageFloor"
          value={formData.signageFloor}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="N/A">N/A</option>
        </Select>
        <Select
          label="Posee en la pared?"
          id="signageWall"
          name="signageWall"
          value={formData.signageWall}
          onChange={onChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="N/A">N/A</option>
        </Select>
        <Select
          label="Posee en altura?"
          id="signageHeight"
          name="signageHeight"
          value={formData.signageHeight}
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
