import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { SectionProps } from '../types';

export const SignageSection = ({ form }: SectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="signageCondition"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                label="Estado y Conservacion"
                id="signageCondition"
                placeholder="Describa el estado y conservacion de la senalizacion del extintor"
                rows={3}
                required
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="signageFloor"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="Posee en el piso?"
                  id="signageFloor"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Si">Si</option>
                  <option value="No">No</option>
                  <option value="N/A">N/A</option>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="signageWall"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="Posee en la pared?"
                  id="signageWall"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Si">Si</option>
                  <option value="No">No</option>
                  <option value="N/A">N/A</option>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="signageHeight"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="Posee en altura?"
                  id="signageHeight"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Si">Si</option>
                  <option value="No">No</option>
                  <option value="N/A">N/A</option>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
