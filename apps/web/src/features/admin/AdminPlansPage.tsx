import { useState, useEffect, useCallback, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Plus, Pencil, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonTable } from '@/components/common/SkeletonLoader';
import { DataTable } from '@/components/common/DataTable';
import { ColorBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency } from '@/lib/utils/dateUtils';
import * as api from '@/lib/api/services';
import { createLogger } from '@/lib/utils/logger';
import type { SubscriptionPlanRow } from './types';

const logger = createLogger('AdminPlansPage');

// --- Plan status badge ---

function PlanStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <ColorBadge variant={isActive ? 'emerald' : 'muted'} label={isActive ? 'Activo' : 'Inactivo'} />
  );
}

// --- Zod schema ---

const planSchema = z.object({
  key: z
    .string()
    .min(1, 'La clave es obligatoria')
    .regex(/^[a-z0-9_-]+$/, 'Solo minúsculas, números, guiones'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  features: z.string().min(1, 'Ingresá al menos una característica'),
  sortOrder: z.number().min(0),
  description: z.string(),
  tag: z.string(),
  highlighted: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

// --- Page ---

const AdminPlansPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; planId: string }>({
    open: false,
    planId: '',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      key: '',
      name: '',
      price: 0,
      features: '',
      sortOrder: 0,
      description: '',
      tag: '',
      highlighted: false,
    },
  });

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      logger.error('Error fetching plans', err);
      toast.error('Error al cargar los planes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // --- Dialog helpers ---

  const openCreateDialog = () => {
    setEditingPlan(null);
    form.reset({
      key: '',
      name: '',
      price: 0,
      features: '',
      sortOrder: 0,
      description: '',
      tag: '',
      highlighted: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlanRow) => {
    setEditingPlan(plan);
    form.reset({
      key: plan.key,
      name: plan.name,
      price: plan.price / 100,
      features: plan.features.join(', '),
      sortOrder: plan.sortOrder,
      description: plan.description,
      tag: plan.tag || '',
      highlighted: plan.highlighted,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPlan(null);
  };

  // --- CRUD handlers ---

  const onSubmit = async (values: PlanFormValues) => {
    setSaving(true);
    const features = values.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const priceInCents = Math.round(values.price * 100);

    try {
      if (editingPlan) {
        await api.updateSubscriptionPlan(editingPlan.id, {
          name: values.name,
          price: priceInCents,
          features,
          sortOrder: values.sortOrder,
          description: values.description,
          tag: values.tag || null,
          highlighted: values.highlighted,
        });
        toast.success('Plan actualizado');
      } else {
        await api.createSubscriptionPlan({
          key: values.key,
          name: values.name,
          price: priceInCents,
          features,
          sortOrder: values.sortOrder,
          description: values.description,
          tag: values.tag || null,
          highlighted: values.highlighted,
        });
        toast.success('Plan creado');
      }
      closeDialog();
      await fetchPlans();
    } catch (err) {
      logger.error('Error saving plan', err);
      toast.error(editingPlan ? 'Error al actualizar el plan' : 'Error al crear el plan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (plan: SubscriptionPlanRow) => {
    setActionLoading(plan.id);
    try {
      await api.toggleSubscriptionPlan(plan.id, !plan.isActive);
      toast.success(plan.isActive ? 'Plan desactivado' : 'Plan activado');
      await fetchPlans();
    } catch (err) {
      logger.error('Error toggling plan', err);
      toast.error('Error al cambiar el estado del plan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (planId: string) => {
    setDeleteDialog({ open: false, planId: '' });
    setActionLoading(planId);
    try {
      await api.deleteSubscriptionPlan(planId);
      toast.success('Plan eliminado');
      await fetchPlans();
    } catch (err) {
      logger.error('Error deleting plan', err);
      toast.error('Error al eliminar el plan');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Columns ---

  const columns: ColumnDef<SubscriptionPlanRow, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'key',
        header: 'Clave',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.key}</span>
        ),
        meta: { hideOnMobile: true },
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nombre
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Precio
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatCurrency(row.original.price / 100),
        meta: { hideOnMobile: true },
      },
      {
        accessorKey: 'features',
        header: 'Caracter\u00edsticas',
        cell: ({ row }) => {
          const features = row.original.features;
          const text = features.join(', ');
          return (
            <span
              className="text-sm text-muted-foreground truncate max-w-[300px] block"
              title={text}
            >
              {text || '\u2014'}
            </span>
          );
        },
        meta: { hideOnMobile: true },
      },
      {
        accessorKey: 'isActive',
        header: 'Estado',
        cell: ({ row }) => <PlanStatusBadge isActive={row.original.isActive} />,
      },
      {
        accessorKey: 'sortOrder',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Orden
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => row.original.sortOrder,
        meta: { hideOnMobile: true },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const plan = row.original;
          const loading = actionLoading === plan.id;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={loading}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Acciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggle(plan)}>
                    <Power className="mr-2 h-4 w-4" />
                    {plan.isActive ? 'Desactivar' : 'Activar'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialog({ open: true, planId: plan.id })}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [actionLoading]
  );

  // --- Render ---

  if (isLoading) {
    return (
      <PageLayout title="Planes" showNotifications={false}>
        <SkeletonTable rows={6} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Planes"
      showNotifications={false}
      headerActions={
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo plan
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={plans}
        searchKey="name"
        searchPlaceholder="Buscar plan..."
        pageSize={10}
        cardRenderer={(row) => {
          const loading = actionLoading === row.id;
          return (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <span className="font-medium">{row.name}</span>
                <span
                  className={
                    row.isActive ? 'text-sm text-emerald-600' : 'text-sm text-muted-foreground'
                  }
                >
                  {row.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(row.price / 100)}/mes · Orden: {row.sortOrder}
              </div>
              <div className="mt-2 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loading}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(row)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggle(row)}>
                      <Power className="mr-2 h-4 w-4" />
                      {row.isActive ? 'Desactivar' : 'Activar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteDialog({ open: true, planId: row.id })}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={dialogOpen}
        onClose={closeDialog}
        title={editingPlan ? 'Editar plan' : 'Nuevo plan'}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave (identificador único)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ej: basic, standard, premium"
                      disabled={!!editingPlan}
                    />
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
                  <FormLabel>Características (separadas por coma)</FormLabel>
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ej: Para escuelas pequeñas" />
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
                      <Input {...field} placeholder="ej: Más Popular" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                {editingPlan ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, planId: '' })}
        onConfirm={() => handleDelete(deleteDialog.planId)}
        title="\u00bfEliminar este plan?"
        message="Esta acci\u00f3n no se puede deshacer. Las escuelas con este plan no se ver\u00e1n afectadas."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </PageLayout>
  );
};

export default AdminPlansPage;
