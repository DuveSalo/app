import { useState, useEffect, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import * as api from '@/lib/api/services';
import { Employee, QRDocumentType, CompanyServices, Company } from '../../../types/index';
import type { Subscription, PaymentTransaction } from '../../../types/subscription';
import { useToast } from '../../../components/common/Toast';

export interface CompanyFormData {
  name: string;
  cuit: string;
  address: string;
  services: QRDocumentType[];
  postalCode: string;
  city: string;
  province: string;
  country: string;
}

export const useSettingsData = () => {
  const { currentUser, currentCompany, refreshCompany, updateUserDetails, logout } = useAuth();
  const { showSuccess, showWarning } = useToast();

  const [activeTab, setActiveTab] = useState('company');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [companyForm, setCompanyForm] = useState<Partial<CompanyFormData>>({});
  const [companyFormErrors, setCompanyFormErrors] = useState({
    name: '', cuit: '', address: '', postalCode: '', city: '', province: '', country: '',
  });
  const [employeeForm, setEmployeeForm] = useState<Omit<Employee, 'id'>>({ name: '', email: '', role: '' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentCompany) {
      setCompanyForm({
        name: currentCompany.name,
        cuit: currentCompany.cuit,
        address: currentCompany.address,
        services: currentCompany.services ? (Object.keys(currentCompany.services) as QRDocumentType[]).filter(key => currentCompany.services?.[key]) : [],
        postalCode: currentCompany.postalCode,
        city: currentCompany.city,
        province: currentCompany.province,
        country: currentCompany.country,
      });
      setCompanyFormErrors({ name: '', cuit: '', address: '', postalCode: '', city: '', province: '', country: '' });
    }
  }, [currentCompany]);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({ name: currentUser.name, email: currentUser.email });
    }
  }, [currentUser]);

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

  const validateCompanyField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
      case 'city':
      case 'province':
      case 'country':
        return /^[a-zA-Z\s'-]+$/.test(value) ? '' : 'Solo se permiten letras y espacios.';
      case 'cuit':
        return /^\d{2}-\d{8}-\d{1}$/.test(value) ? '' : 'Formato de CUIT inválido. Use XX-XXXXXXXX-X.';
      case 'postalCode':
        return /^[a-zA-Z0-9]{4,8}$/.test(value) ? '' : 'El código postal debe tener entre 4 y 8 caracteres.';
      default:
        return '';
    }
  };

  const handleCompanyFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'cuit') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) {
        finalValue = digits;
      } else if (digits.length <= 10) {
        finalValue = `${digits.slice(0, 2)}-${digits.slice(2)}`;
      } else {
        finalValue = `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
      }
    }

    setCompanyForm(prev => ({ ...prev, [name]: finalValue }));
    const errorMsg = validateCompanyField(name, finalValue);
    setCompanyFormErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const isCompanyFormValid = () => {
    return Object.values(companyFormErrors).every(err => err === '');
  };

  const handleCompanySubmit = async (e?: FormEvent | MouseEvent) => {
    e?.preventDefault();
    if (!currentCompany || !isCompanyFormValid()) {
      setError('Por favor, corrija los errores en el formulario.');
      return;
    }
    setIsLoading(true); setError('');
    try {
      const services: CompanyServices = (companyForm.services || []).reduce((acc, service) => {
        acc[service] = true;
        return acc;
      }, {} as CompanyServices);

      const updatePayload: Partial<Company> = {
        id: currentCompany.id,
        services,
      };

      if (companyForm.name) updatePayload.name = companyForm.name;
      if (companyForm.cuit) updatePayload.cuit = companyForm.cuit;
      if (companyForm.address) updatePayload.address = companyForm.address;
      if (companyForm.postalCode) updatePayload.postalCode = companyForm.postalCode;
      if (companyForm.city) updatePayload.city = companyForm.city;
      if (companyForm.province) updatePayload.province = companyForm.province;
      if (companyForm.country) updatePayload.country = companyForm.country;

      await api.updateCompany(updatePayload);
      await refreshCompany();
      setIsEditingCompany(false);
      showSuccess('Información de empresa actualizada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la empresa';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      if (editingEmployee) {
        await api.updateEmployee({ ...employeeForm, id: editingEmployee.id });
      } else {
        await api.addEmployee(employeeForm);
      }
      setShowEmployeeModal(false);
      setEditingEmployee(null);
      setEmployeeForm({ name: '', email: '', role: '' });
      await refreshCompany();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el empleado';
      setError(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el empleado';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await updateUserDetails({ name: profileForm.name });
      setIsEditingProfile(false);
      showSuccess('Perfil actualizado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el perfil.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser) return;
    setIsPasswordResetLoading(true);
    setError('');
    try {
      await api.sendPasswordResetEmail(currentUser.email);
      showSuccess('Se ha enviado un enlace para restablecer la contraseña a su correo electrónico');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar el correo electrónico.';
      setError(message);
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  const openEmployeeModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setEmployeeForm({ name: employee.name, email: employee.email, role: employee.role });
    } else {
      setEditingEmployee(null);
      setEmployeeForm({ name: '', email: '', role: 'Usuario' });
    }
    setShowEmployeeModal(true);
  };

  const handleCancelCompanyEdit = () => {
    if (currentCompany) {
      setCompanyForm({
        name: currentCompany.name,
        cuit: currentCompany.cuit,
        address: currentCompany.address,
        services: currentCompany.services ? (Object.keys(currentCompany.services) as QRDocumentType[]).filter(key => currentCompany.services?.[key]) : [],
        postalCode: currentCompany.postalCode,
        city: currentCompany.city,
        province: currentCompany.province,
        country: currentCompany.country,
      });
      setCompanyFormErrors({ name: '', cuit: '', address: '', postalCode: '', city: '', province: '', country: '' });
    }
    setIsEditingCompany(false);
    setError('');
  };

  const handleCancelProfileEdit = () => {
    if (currentUser) {
      setProfileForm({ name: currentUser.name, email: currentUser.email });
    }
    setIsEditingProfile(false);
    setError('');
  };

  // Subscription handlers (provider-aware)
  const handleCancelSubscription = async () => {
    if (!subscription) return;
    console.debug('[MP] useSettingsData: Cancel subscription', {
      provider: subscription.paymentProvider,
      mpId: subscription.mpPreapprovalId,
      paypalId: subscription.paypalSubscriptionId,
    });
    setIsLoading(true);
    setError('');
    try {
      if (subscription.paymentProvider === 'mercadopago' && subscription.mpPreapprovalId) {
        console.debug('[MP] useSettingsData: Cancelling via MercadoPago');
        await api.mpManageSubscription({
          action: 'cancel',
          mpPreapprovalId: subscription.mpPreapprovalId,
        });
      } else if (subscription.paypalSubscriptionId) {
        await api.manageSubscription({
          action: 'cancel',
          subscriptionId: subscription.paypalSubscriptionId,
          reason: 'Cancelacion solicitada por el usuario',
        });
      }
      await refreshCompany();
      const updated = await api.getActiveSubscription(currentCompany!.id);
      setSubscription(updated);
      showSuccess('Suscripcion cancelada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cancelar la suscripcion';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    console.debug('[MP] useSettingsData: Reactivate subscription', {
      provider: subscription.paymentProvider,
      mpId: subscription.mpPreapprovalId,
    });
    setIsLoading(true);
    setError('');
    try {
      if (subscription.paymentProvider === 'mercadopago' && subscription.mpPreapprovalId) {
        console.debug('[MP] useSettingsData: Reactivating via MercadoPago');
        await api.mpManageSubscription({
          action: 'reactivate',
          mpPreapprovalId: subscription.mpPreapprovalId,
        });
      } else if (subscription.paypalSubscriptionId) {
        await api.manageSubscription({
          action: 'reactivate',
          subscriptionId: subscription.paypalSubscriptionId,
          reason: 'Reactivacion solicitada por el usuario',
        });
      }
      await refreshCompany();
      const updated = await api.getActiveSubscription(currentCompany!.id);
      setSubscription(updated);
      showSuccess('Suscripcion reactivada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al reactivar la suscripcion';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpChangePlan = async (newPlanKey: string) => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpCreateSubscription = async (data: { planKey: string; cardTokenId: string; payerEmail: string }) => {
    if (!currentCompany) return;
    console.debug('[MP] useSettingsData: Create subscription', {
      planKey: data.planKey,
      companyId: currentCompany.id,
      hasToken: !!data.cardTokenId,
      email: data.payerEmail,
    });
    setIsLoading(true);
    setError('');
    try {
      const result = await api.mpCreateSubscription({
        planKey: data.planKey,
        companyId: currentCompany.id,
        cardTokenId: data.cardTokenId,
        payerEmail: data.payerEmail,
      });
      console.debug('[MP] useSettingsData: Create subscription result:', result);
      await refreshCompany(true);
      const updated = await api.getActiveSubscription(currentCompany.id);
      setSubscription(updated);
      const updatedPayments = await api.getPaymentHistory(currentCompany.id, 5);
      setPayments(updatedPayments);
      showSuccess('Suscripcion creada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la suscripcion';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaypalChangePlan = async (newPlanKey: string) => {
    if (!subscription?.paypalSubscriptionId || !currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      // PayPal plan change: create-subscription edge function cancels old + creates new
      const result = await api.createSubscription({
        planKey: newPlanKey,
        companyId: currentCompany.id,
      });
      // Activate the new subscription (PayPal requires server-side activation)
      await api.activateSubscription({
        subscriptionId: result.subscriptionId,
        companyId: currentCompany.id,
        oldPlanName: subscription.planName,
      });
      await refreshCompany(true);
      const updated = await api.getActiveSubscription(currentCompany.id);
      setSubscription(updated);
      const updatedPayments = await api.getPaymentHistory(currentCompany.id, 5);
      setPayments(updatedPayments);
      showSuccess('Plan actualizado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar de plan';
      setError(message);
      throw err;
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
    companyForm,
    setCompanyForm,
    companyFormErrors,
    handleCompanyFormChange,
    handleCompanySubmit,
    handleCancelCompanyEdit,
    isCompanyFormValid,
    // Employees
    showEmployeeModal,
    setShowEmployeeModal,
    editingEmployee,
    employeeForm,
    setEmployeeForm,
    openEmployeeModal,
    handleEmployeeSubmit,
    handleDeleteEmployee,
    // Profile
    isEditingProfile,
    setIsEditingProfile,
    profileForm,
    setProfileForm,
    handleProfileSubmit,
    handleCancelProfileEdit,
    handlePasswordReset,
    isPasswordResetLoading,
    // Billing
    subscription,
    payments,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleSubscriptionChange,
    handleMpChangePlan,
    handlePaypalChangePlan,
    handleMpCreateSubscription,
    // Shared
    isLoading,
    error,
  };
};
