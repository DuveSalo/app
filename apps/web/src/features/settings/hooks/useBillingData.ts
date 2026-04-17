import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/AuthContext';
import * as api from '@/lib/api/services';
import type { Subscription, PaymentTransaction } from '../../../types/subscription';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';

export const useBillingData = () => {
  const { currentCompany, refreshCompany } = useAuth();
  const queryClient = useQueryClient();
  const companyId = currentCompany?.id ?? '';

  // --- Queries ---

  const { data: subscription = null, isLoading: isLoadingSubscription } = useQuery({
    queryKey: queryKeys.subscription(companyId),
    queryFn: () => api.getActiveSubscription(companyId),
    enabled: !!companyId,
  });

  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: queryKeys.payments(companyId),
    queryFn: () => api.getPaymentHistory(companyId, 5),
    enabled: !!companyId,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const invalidateAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription(companyId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.payments(companyId) }),
    ]);
  }, [queryClient, companyId]);

  // --- Mutation handlers ---

  const handleBankTransferPayment = async (data: { planKey: string; amount: number }) => {
    if (!currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      await api.submitBankTransferPayment({
        companyId: currentCompany.id,
        planKey: data.planKey,
        amount: data.amount,
      });
      await refreshCompany(true);
      await invalidateAll();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar la transferencia';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionChange = useCallback(async () => {
    if (!currentCompany) return;
    await refreshCompany(true);
    await invalidateAll();
    toast.success('Suscripción actualizada');
  }, [currentCompany, refreshCompany, invalidateAll]);

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Bank transfer subscriptions are cancelled by admin; user can request cancellation
      toast.info('Contactá al soporte para cancelar tu suscripción');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cancelar la suscripción';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    setError('');
    try {
      toast.info('Contactá al soporte para reactivar tu suscripción');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al reactivar la suscripción';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async (_newPlanKey: string) => {
    toast.info('Contactá al soporte para cambiar de plan');
  };

  return {
    subscription,
    payments,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleSubscriptionChange,
    handleBankTransferPayment,
    handleChangePlan,
    isLoading: isLoading || isLoadingSubscription || isLoadingPayments,
    error,
  };
};
