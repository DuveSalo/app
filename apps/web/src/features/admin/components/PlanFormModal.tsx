import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Modal } from '@/components/common/Modal';
import { planSchema, type PlanFormValues } from '../schemas';
import type { SubscriptionPlanRow } from '../types';

const EMPTY_DEFAULTS: PlanFormValues = {
  key: '',
  name: '',
  price: 0,
  features: '',
  sortOrder: 0,
  description: '',
  tag: '',
  highlighted: true,
};

function planToFormValues(plan: SubscriptionPlanRow): PlanFormValues {
  return {
    key: plan.key,
    name: plan.name,
    price: plan.price / 100,
    features: plan.features.join(', '),
    sortOrder: plan.sortOrder,
    description: plan.description,
    tag: plan.tag || '',
    highlighted: plan.highlighted,
  };
}

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlan: SubscriptionPlanRow | null;
  saving: boolean;
  onSubmit: (values: PlanFormValues) => Promise<void>;
}

export const PlanFormModal = ({
  isOpen,
  onClose,
  editingPlan,
  saving,
  onSubmit,
}: PlanFormModalProps) => {
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(editingPlan ? planToFormValues(editingPlan) : EMPTY_DEFAULTS);
    }
  }, [isOpen, editingPlan, form]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPlan ? 'Editar plan' : 'Nuevo plan'}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clave (identificador unico)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ej: basic, standard, premium" disabled={!!editingPlan} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (ARS)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caracteristicas (separadas por coma)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripcion</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ej: Para escuelas pequenas" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Orden</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Etiqueta (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ej: Mas Popular" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingPlan ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};
