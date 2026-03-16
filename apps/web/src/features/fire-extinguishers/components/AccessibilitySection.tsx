import { Select } from '../../../components/common/Select';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { SectionProps } from '../types';

export const AccessibilitySection = ({ form }: SectionProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Verifique la accesibilidad del extintor.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="visibilityObstructed"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="Esta obstruida su visibilidad?"
                  id="visibilityObstructed"
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
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessObstructed"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="Esta obstruido su acceso?"
                  id="accessObstructed"
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
