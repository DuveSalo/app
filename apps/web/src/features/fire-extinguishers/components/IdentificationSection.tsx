import { Input } from '../../../components/common/Input';
import { DatePicker } from '../../../components/common/DatePicker';
import { Select } from '../../../components/common/Select';
import { ExtinguisherType, ExtinguisherCapacity } from '../../../types/index';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { SectionProps } from '../types';

export const IdentificationSection = ({ form }: SectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="controlDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  label="Fecha de Control"
                  id="controlDate"
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
          name="extinguisherNumber"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  label="Número de Extintor"
                  id="extinguisherNumber"
                  type="text"
                  placeholder="Ej: EXT-001"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="Tipo"
                  id="type"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                  required
                >
                  <option value="">Seleccione...</option>
                  {Object.values(ExtinguisherType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  label="Capacidad"
                  id="capacity"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                  required
                >
                  <option value="">Seleccione...</option>
                  {Object.values(ExtinguisherCapacity).map((cap) => (
                    <option key={cap} value={cap}>
                      {cap} kg
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="class"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  label="Clase"
                  id="class"
                  type="text"
                  placeholder="Ej: ABC"
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
