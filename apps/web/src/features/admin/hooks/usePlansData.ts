import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '@/lib/api/services';
import { queryKeys } from '@/lib/queryKeys';
import { createLogger } from '@/lib/utils/logger';
import type { PlanFormValues } from '../schemas';
import type { SubscriptionPlanRow } from '../types';

const logger = createLogger('AdminPlansPage');

export function usePlansData() {
  const queryClient = useQueryClient();
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

  const openCreateDialog = useCallback(() => {
    setEditingPlan(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((plan: SubscriptionPlanRow) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingPlan(null);
  }, []);

  // --- CRUD handlers ---

  const onSubmit = useCallback(async (values: PlanFormValues) => {
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
      queryClient.invalidateQueries({ queryKey: queryKeys.plans() });
      closeDialog();
      await fetchPlans();
    } catch (err) {
      logger.error('Error saving plan', err);
      toast.error(editingPlan ? 'Error al actualizar el plan' : 'Error al crear el plan');
    } finally {
      setSaving(false);
    }
  }, [editingPlan, closeDialog, fetchPlans]);

  const handleToggle = useCallback(async (plan: SubscriptionPlanRow) => {
    setActionLoading(plan.id);
    try {
      await api.toggleSubscriptionPlan(plan.id, !plan.isActive);
      toast.success(plan.isActive ? 'Plan desactivado' : 'Plan activado');
      queryClient.invalidateQueries({ queryKey: queryKeys.plans() });
      await fetchPlans();
    } catch (err) {
      logger.error('Error toggling plan', err);
      toast.error('Error al cambiar el estado del plan');
    } finally {
      setActionLoading(null);
    }
  }, [fetchPlans]);

  const handleDelete = useCallback(async (planId: string) => {
    setDeleteDialog({ open: false, planId: '' });
    setActionLoading(planId);
    try {
      await api.deleteSubscriptionPlan(planId);
      toast.success('Plan eliminado');
      queryClient.invalidateQueries({ queryKey: queryKeys.plans() });
      await fetchPlans();
    } catch (err) {
      logger.error('Error deleting plan', err);
      toast.error('Error al eliminar el plan');
    } finally {
      setActionLoading(null);
    }
  }, [fetchPlans]);

  const openDeleteDialog = useCallback((planId: string) => {
    setDeleteDialog({ open: true, planId });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, planId: '' });
  }, []);

  return {
    plans,
    isLoading,
    dialogOpen,
    editingPlan,
    saving,
    deleteDialog,
    actionLoading,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    onSubmit,
    handleToggle,
    handleDelete,
    openDeleteDialog,
    closeDeleteDialog,
  };
}
