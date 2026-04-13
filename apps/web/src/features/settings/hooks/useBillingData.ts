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

  // --- Card info (local state, fetched on demand) ---

  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardLastFour, setCardLastFour] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const invalidateAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription(companyId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.payments(companyId) }),
    ]);
  }, [queryClient, companyId]);

  // --- Sync from MercadoPago (with DB fallback for card info) ---

  const syncMercadoPagoStatus = useCallback(() => {
    if (!subscription?.mpPreapprovalId) return;
    if (subscription.status !== 'active' && subscription.status !== 'suspended') return;

    api
      .mpGetSubscriptionStatus(subscription.mpPreapprovalId)
      .then(async (status) => {
        setCardBrand(status.paymentMethodId);
        if (status.cardLastFour) {
          setCardLastFour(status.cardLastFour);
        } else if (companyId) {
          // Fallback: read card info from latest completed payment
          const cardInfo = await api.getCardInfoFromPayments(companyId);
          if (cardInfo.cardLastFour) setCardLastFour(cardInfo.cardLastFour);
          if (cardInfo.cardBrand && !status.paymentMethodId) setCardBrand(cardInfo.cardBrand);
        }
      })
      .catch(console.error);
  }, [subscription?.mpPreapprovalId, subscription?.status, companyId]);

  // --- Mutation handlers ---

  const handleCancelSubscription = async () => {
    if (!subscription?.mpPreapprovalId) return;
    setIsLoading(true);
    setError('');
    try {
      await api.mpManageSubscription({
        action: 'cancel',
        mpPreapprovalId: subscription.mpPreapprovalId,
      });
      await refreshCompany();
      await invalidateAll();
      toast.success('Suscripción cancelada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cancelar la suscripción';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription?.mpPreapprovalId) return;
    setIsLoading(true);
    setError('');
    try {
      await api.mpManageSubscription({
        action: 'reactivate',
        mpPreapprovalId: subscription.mpPreapprovalId,
      });
      await refreshCompany();
      await invalidateAll();
      toast.success('Suscripción reactivada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al reactivar la suscripción';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async (newPlanKey: string) => {
    if (!subscription?.mpPreapprovalId || !currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      await api.mpManageSubscription({
        action: 'change_plan',
        mpPreapprovalId: subscription.mpPreapprovalId,
        newPlanKey,
      });
      await refreshCompany();
      await invalidateAll();
      toast.success('Plan actualizado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar de plan';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubscription = async (data: {
    planKey: string;
    cardTokenId: string;
    payerEmail: string;
    cardBrand?: string | null;
    cardLastFour?: string | null;
    paymentTypeId?: string | null;
  }) => {
    if (!currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      await api.mpCreateSubscription({
        planKey: data.planKey,
        companyId: currentCompany.id,
        cardTokenId: data.cardTokenId,
        payerEmail: data.payerEmail,
        cardBrand: data.cardBrand,
        cardLastFour: data.cardLastFour,
        paymentTypeId: data.paymentTypeId,
      });
      await refreshCompany(true);
      await invalidateAll();
      toast.success('Suscripción creada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la suscripción';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeCard = async (cardTokenId: string) => {
    if (!subscription?.mpPreapprovalId || !currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      await api.mpManageSubscription({
        action: 'change_card',
        mpPreapprovalId: subscription.mpPreapprovalId,
        cardTokenId,
      });
      const status = await api.mpGetSubscriptionStatus(subscription.mpPreapprovalId);
      setCardBrand(status.paymentMethodId);
      setCardLastFour(status.cardLastFour);
      toast.success('Tarjeta actualizada correctamente');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la tarjeta';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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

  return {
    subscription,
    payments,
    cardBrand,
    cardLastFour,
    syncMercadoPagoStatus,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleSubscriptionChange,
    handleBankTransferPayment,
    handleChangePlan,
    handleChangeCard,
    handleCreateSubscription,
    isLoading: isLoading || isLoadingSubscription || isLoadingPayments,
    error,
  };
};
