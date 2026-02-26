import { Textarea } from '../../../components/common/Textarea';
import { SectionProps } from '../types';

interface ObservationsSectionProps extends SectionProps {
  formError?: string;
}

export const ObservationsSection = ({ formData, onChange, formError }: ObservationsSectionProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm font-light text-neutral-500">Agregue cualquier observacion adicional sobre el control del extintor.</p>
      <Textarea
        label="Observaciones Generales"
        id="observations"
        name="observations"
        value={formData.observations}
        onChange={onChange}
        placeholder="Ingrese observaciones generales sobre el control (opcional)"
        rows={6}
      />
      {formError && <p className="text-sm text-red-600 mt-4">{formError}</p>}
    </div>
  );
};
