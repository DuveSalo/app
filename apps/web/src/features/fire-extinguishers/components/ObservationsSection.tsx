import { Textarea } from '../../../components/common/Textarea';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { ObservationsSectionProps } from '../types';

export const ObservationsSection = ({ form, formError }: ObservationsSectionProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Agregue cualquier observacion adicional sobre el control del extintor.</p>
      <FormField
        control={form.control}
        name="observations"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                label="Observaciones Generales"
                id="observations"
                placeholder="Ingrese observaciones generales sobre el control (opcional)"
                rows={6}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      {formError && <p className="text-sm text-destructive mt-4">{formError}</p>}
    </div>
  );
};
