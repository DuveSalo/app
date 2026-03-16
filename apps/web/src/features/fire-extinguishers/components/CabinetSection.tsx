import { Select } from '../../../components/common/Select';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { SectionProps } from '../types';

export const CabinetSection = ({ form }: SectionProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Indique el estado del gabinete donde se encuentra el extintor.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="glassCondition"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="El vidrio esta en condiciones?"
                  id="glassCondition"
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
          name="doorOpensEasily"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="La puerta se abre sin dificultad?"
                  id="doorOpensEasily"
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
          name="cabinetClean"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="El gabinete esta limpio?"
                  id="cabinetClean"
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
