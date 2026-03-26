import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/common/Input';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import type { SelfProtectionSystemFormValues } from '../schemas';

interface ProfesionalTabProps {
  form: UseFormReturn<SelfProtectionSystemFormValues>;
}

export const ProfesionalTab = ({ form }: ProfesionalTabProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="intervener"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input id="intervener" label="Personal Interviniente" {...field} required />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="registrationNumber"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input id="registrationNumber" label="Matrícula" {...field} required />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
