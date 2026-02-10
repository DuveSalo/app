import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import * as api from '@/lib/api/services';
import { Employee, QRDocumentType, CompanyServices, Company } from '../../../types/index';
import type { PaymentTransaction } from '../../../lib/api/services/subscription';
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
  const { currentUser, currentCompany, refreshCompany, updateUserDetails, logout, changePlan, cancelSubscription, pauseSubscription } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [activeTab, setActiveTab] = useState('company');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingAction, setBillingAction] = useState<'change' | 'cancel' | 'pause'>('change');

  const [companyForm, setCompanyForm] = useState<Partial<CompanyFormData>>({});
  const [companyFormErrors, setCompanyFormErrors] = useState({
    name: '', cuit: '', address: '', postalCode: '', city: '', province: '', country: '',
  });
  const [employeeForm, setEmployeeForm] = useState<Omit<Employee, 'id'>>({ name: '', email: '', role: '' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSelectedPlanId, setNewSelectedPlanId] = useState<string>('');
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

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
      setNewSelectedPlanId(currentCompany.selectedPlan || '');
      setCompanyFormErrors({ name: '', cuit: '', address: '', postalCode: '', city: '', province: '', country: '' });
    }
  }, [currentCompany]);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({ name: currentUser.name, email: currentUser.email });
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'billing' && paymentHistory.length === 0) {
      setIsLoadingPayments(true);
      api.getPaymentHistory()
        .then(setPaymentHistory)
        .catch(() => setPaymentHistory([]))
        .finally(() => setIsLoadingPayments(false));
    }
  }, [activeTab]);

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

  const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setCompanyForm(prev => ({...prev, [name]: finalValue}));
    const errorMsg = validateCompanyField(name, finalValue);
    setCompanyFormErrors(prev => ({...prev, [name]: errorMsg}));
  };

  const isCompanyFormValid = () => {
    return Object.values(companyFormErrors).every(err => err === '');
  };

  const handleCompanySubmit = async (e?: React.FormEvent | React.MouseEvent) => {
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

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
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

  const handleBillingAction = async () => {
    setIsLoading(true); setError('');
    try {
      if (billingAction === 'change') {
        if (!newSelectedPlanId || newSelectedPlanId === currentCompany?.selectedPlan) {
          setShowBillingModal(false);
          return;
        }
        const initPoint = await changePlan(newSelectedPlanId);
        setShowBillingModal(false);
        if (initPoint) {
          window.location.href = initPoint;
          return;
        }
        await refreshCompany();
      } else if (billingAction === 'pause') {
        await pauseSubscription();
        setShowBillingModal(false);
        await refreshCompany();
        showSuccess('Suscripcion pausada correctamente');
      } else {
        await cancelSubscription();
        setShowBillingModal(false);
        await refreshCompany();
        showSuccess('Suscripcion cancelada correctamente');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Error al ${billingAction === 'change' ? 'cambiar de plan' : billingAction === 'pause' ? 'pausar' : 'cancelar'} la suscripcion`;
      setError(message);
    } finally {
      setIsLoading(false);
    }
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
    showBillingModal,
    setShowBillingModal,
    billingAction,
    setBillingAction,
    handleBillingAction,
    newSelectedPlanId,
    setNewSelectedPlanId,
    paymentHistory,
    isLoadingPayments,
    // Shared
    isLoading,
    error,
  };
};
