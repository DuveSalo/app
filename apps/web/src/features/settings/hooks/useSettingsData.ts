import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import * as api from '@/lib/api/services';
import { Employee, QRDocumentType, CompanyServices, Company } from '../../../types/index';
import type { Subscription, PaymentTransaction } from '../../../types/subscription';
import { useToast } from '../../../components/common/Toast';
import type { CompanyInfoFormValues } from '../schemas';
import type { EmployeeFormValues } from '../schemas';

const VALID_TABS = ['company', 'employees', 'billing', 'profile'];

export const useSettingsData = () => {
  const { currentUser, currentCompany, refreshCompany, logout } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [searchParams] = useSearchParams();

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : 'company'
  );
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

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

  // Sync fresh data from MercadoPago when viewing billing tab
  useEffect(() => {
    if (activeTab !== 'billing' || !subscription?.mpPreapprovalId) return;
    if (subscription.status !== 'active' && subscription.status !== 'suspended') return;

    api.mpGetSubscriptionStatus(subscription.mpPreapprovalId)
      .then((status) => {
        setCardBrand(status.paymentMethodId);
        setCardLastFour(status.cardLastFour);
        // Update next billing time if we got a fresh value
        if (status.nextPaymentDate) {
          setSubscription((prev) =>
            prev ? { ...prev, nextBillingTime: status.nextPaymentDate } : prev,
          );
        }
      })
      .catch(console.error);
  }, [activeTab, subscription?.mpPreapprovalId, subscription?.status]);

  const handleCompanySubmit = async (values: CompanyInfoFormValues) => {
    if (!currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      const services: CompanyServices = values.services.reduce((acc, service) => {
        acc[service as QRDocumentType] = true;
        return acc;
      }, {} as CompanyServices);

      const updatePayload: Partial<Company> = {
        id: currentCompany.id,
        name: values.name,
        cuit: values.cuit,
        address: values.address,
        postalCode: values.postalCode,
        city: values.city,
        province: values.province,
        country: values.country,
        phone: values.phone,
        services,
      };

      await api.updateCompany(updatePayload);
      await refreshCompany();
      setIsEditingCompany(false);
      showSuccess('Información de empresa actualizada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la empresa';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSubmit = async (values: EmployeeFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      if (editingEmployee) {
        await api.updateEmployee({ ...values, id: editingEmployee.id });
      } else {
        await api.addEmployee(values);
      }
      setShowEmployeeModal(false);
      setEditingEmployee(null);
      await refreshCompany();
      showSuccess('Empleado guardado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el empleado';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (currentUser?.email === employee.email) {
      showWarning('No puedes eliminar tu propia cuenta.'); return;
    }
    if ((currentCompany?.employees?.length ?? 0) <= 1) {
      showWarning('No se puede eliminar al único empleado.'); return;
    }
    if (!window.confirm('¿Está seguro de que desea eliminar este empleado?')) return;
    setIsLoading(true); setError('');
    try {
      await api.deleteEmployee(employee.id);
      await refreshCompany();
      showSuccess('Empleado eliminado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el empleado';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openEmployeeModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
    } else {
      setEditingEmployee(null);
    }
    setShowEmployeeModal(true);
  };

  const handleCancelCompanyEdit = () => {
    setIsEditingCompany(false);
    setError('');
  };

  // Subscription handlers
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
      showSuccess('Suscripción cancelada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cancelar la suscripción';
      setError(message);
      showError(message);
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
      showSuccess('Suscripción reactivada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al reactivar la suscripción';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async (newPlanKey: string) => {
    if (!subscription?.mpPreapprovalId || !currentCompany) return;
    console.debug('[MP] useSettingsData: Change plan', {
      currentPlan: subscription.planKey,
      newPlan: newPlanKey,
      mpPreapprovalId: subscription.mpPreapprovalId,
    });
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
      showSuccess('Plan actualizado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar de plan';
      setError(message);
      showError(message);
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
      showSuccess('Suscripción creada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la suscripción';
      setError(message);
      showError(message);
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
    showSuccess('Suscripcion actualizada');
  };

  return {
    // Auth
    currentUser,
    currentCompany,
    logout,
    // Tabs
    activeTab,
    setActiveTab,
    // Company
    isEditingCompany,
    setIsEditingCompany,
    handleCompanySubmit,
    handleCancelCompanyEdit,
    // Employees
    showEmployeeModal,
    setShowEmployeeModal,
    editingEmployee,
    openEmployeeModal,
    handleEmployeeSubmit,
    handleDeleteEmployee,
    // Profile (self-contained in ProfileSection)
    // Billing
    subscription,
    payments,
    cardBrand,
    cardLastFour,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleSubscriptionChange,
    handleChangePlan,
    handleCreateSubscription,
    // Shared
    isLoading,
    error,
  };
};
