import { Checkbox } from '../../../components/common/Checkbox';
import { Textarea } from '../../../components/common/Textarea';
import { SectionProps } from '../types';

export const ConditionsSection = ({ formData, onChange, onCheckChange }: SectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Verificaciones</h4>
        <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Checkbox
            label="¿Están legibles las etiquetas identificatorias?"
            id="labelsLegible"
            name="labelsLegible"
            checked={formData.labelsLegible}
            onChange={onCheckChange}
          />
          <Checkbox
            label="¿La presión está dentro del intervalo de funcionamiento?"
            id="pressureWithinRange"
            name="pressureWithinRange"
            checked={formData.pressureWithinRange}
            onChange={onCheckChange}
          />
          <Checkbox
            label="¿Posee precinto y trabas de seguridad?"
            id="hasSealAndSafety"
            name="hasSealAndSafety"
            checked={formData.hasSealAndSafety}
            onChange={onCheckChange}
          />
          <Checkbox
            label="¿Las instrucciones de funcionamiento están legibles?"
            id="instructionsLegible"
            name="instructionsLegible"
            checked={formData.instructionsLegible}
            onChange={onCheckChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Textarea
          label="Estado del Recipiente"
          id="containerCondition"
          name="containerCondition"
          value={formData.containerCondition}
          onChange={onChange}
          placeholder="Describa el estado del recipiente"
          rows={3}
          required
        />
        <Textarea
          label="Estado de Tobera"
          id="nozzleCondition"
          name="nozzleCondition"
          value={formData.nozzleCondition}
          onChange={onChange}
          placeholder="Describa el estado de la tobera"
          rows={3}
          required
        />
      </div>
    </div>
  );
};
