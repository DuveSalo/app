import React from 'react';
import { Textarea } from '../../../components/common/Textarea';
import { SectionProps } from '../types';

interface ObservationsSectionProps extends SectionProps {
  formError?: string;
}

export const ObservationsSection: React.FC<ObservationsSectionProps> = ({ formData, onChange, formError }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Agregue cualquier observación adicional sobre el control del extintor.</p>
      <Textarea
        label="Observaciones Generales"
        id="observations"
        name="observations"
        value={formData.observations}
        onChange={onChange}
        placeholder="Ingrese observaciones generales sobre el control (opcional)"
        rows={6}
      />
      {formError && <p className="text-sm text-red-500 mt-4">{formError}</p>}
    </div>
  );
};
