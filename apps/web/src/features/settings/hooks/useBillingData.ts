import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import * as api from '@/lib/api/services';
import type { Subscription, PaymentTransaction } from '../../../types/subscription';
import { toast } from 'sonner';

export const useBillingData = () => {
  const { currentCompany, refreshCompany } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardLastFour, setCardLastFour] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch subscription and payment data
  useEffect(() => {
    if (currentCompany) {
      api.getActiveSubscription(currentCompany.id)
        .then(setSubscription)
        .catch(console.error);
      api.getPaymentHistory(currentCompany.id, 5)
        .then(setPayments)
        .catch(console.error);
    }
  }, [currentCompany]);

  // Sync fresh data from MercadoPago when subscription is active
  const syncMercadoPagoStatus = () => {
    if (!subscription?.mpPreapprovalId) return;
    if (subscription.status !== 'active' && subscription.status !== 'suspended') return;

    api.mpGetSubscriptionStatus(subscription.mpPreapprovalId)
      .then((status) => {
        setCardBrand(status.paymentMethodId);
        setCardLastFour(status.cardLastFour);
        if (status.nextPaymentDate) {
          setSubscription((prev) =>
            prev ? { ...prev, nextBillingTime: status.nextPaymentDate } : prev,
          );
        }
      })
      .catch(console.error);
  };

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
      const updated = await api.getActiveSubscription(currentCompany!.id);
      setSubscription(updated);
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
      const updated = await api.getActiveSubscription(currentCompany!.id);
      setSubscription(updated);
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
      const updated = await api.getActiveSubscription(currentCompany.id);
      setSubscription(updated);
      const updatedPayments = await api.getPaymentHistory(currentCompany.id, 5);
      setPayments(updatedPayments);
      toast.success('Plan actualizado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar de plan';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubscription = async (data: { planKey: string; cardTokenId: string; payerEmail: string }) => {
    if (!currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      await api.mpCreateSubscription({
        planKey: data.planKey,
        companyId: currentCompany.id,
        cardTokenId: data.cardTokenId,
        payerEmail: data.payerEmail,
      });
      await refreshCompany(true);
      const updated = await api.getActiveSubscription(currentCompany.id);
      setSubscription(updated);
      const updatedPayments = await api.getPaymentHistory(currentCompany.id, 5);
      setPayments(updatedPayments);
      toast.success('Suscripción creada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la suscripción';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionChange = async () => {
    if (!currentCompany) return;
    await refreshCompany(true);
    const updated = await api.getActiveSubscription(currentCompany.id);
    setSubscription(updated);
    const updatedPayments = await api.getPaymentHistory(currentCompany.id, 5);
    setPayments(updatedPayments);
    toast.success('Suscripcion actualizada');
  };

  return {
    subscription,
    payments,
    cardBrand,
    cardLastFour,
    syncMercadoPagoStatus,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleSubscriptionChange,
    handleChangePlan,
    handleCreateSubscription,
    isLoading,
    error,
  };
};
