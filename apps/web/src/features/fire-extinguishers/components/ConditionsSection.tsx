import { Checkbox } from '../../../components/common/Checkbox';
import { Textarea } from '../../../components/common/Textarea';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { SectionProps } from '../types';

export const ConditionsSection = ({ form }: SectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Verificaciones</h4>
        <div className="space-y-3 bg-info/10 p-4 border border-info/30 rounded-md">
          <FormField
            control={form.control}
            name="labelsLegible"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    label="Estan legibles las etiquetas identificatorias?"
                    id="labelsLegible"
                    name="labelsLegible"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pressureWithinRange"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    label="La presion esta dentro del intervalo de funcionamiento?"
                    id="pressureWithinRange"
                    name="pressureWithinRange"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hasSealAndSafety"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    label="Posee precinto y trabas de seguridad?"
                    id="hasSealAndSafety"
                    name="hasSealAndSafety"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instructionsLegible"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    label="Las instrucciones de funcionamiento estan legibles?"
                    id="instructionsLegible"
                    name="instructionsLegible"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="containerCondition"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  label="Estado del Recipiente"
                  id="containerCondition"
                  placeholder="Describa el estado del recipiente"
                  rows={3}
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nozzleCondition"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  label="Estado de Tobera"
                  id="nozzleCondition"
                  placeholder="Describa el estado de la tobera"
                  rows={3}
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
