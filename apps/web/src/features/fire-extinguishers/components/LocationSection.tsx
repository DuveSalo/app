import { Input } from '../../../components/common/Input';
import { DatePicker } from '../../../components/common/DatePicker';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { SectionProps } from '../types';

export const LocationSection = ({ form }: SectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="positionNumber"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  label="Número de Puesto"
                  id="positionNumber"
                  type="text"
                  placeholder="Ej: P-01"
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
          name="manufacturingYear"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  label="Ano de Fabricacion"
                  id="manufacturingYear"
                  type="text"
                  placeholder="Ej: 2023"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="chargeExpirationDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  label="Vencimiento de Carga"
                  id="chargeExpirationDate"
                  value={field.value}
                  onChange={field.onChange}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hydraulicPressureExpirationDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  label="Vencimiento Presion Hidraulica"
                  id="hydraulicPressureExpirationDate"
                  value={field.value}
                  onChange={field.onChange}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="tagColor"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                label="Color de Marbete"
                id="tagColor"
                type="text"
                placeholder="Ej: Rojo"
                required
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
