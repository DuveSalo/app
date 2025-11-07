
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as api from '../../lib/api/supabaseApi';
import { Employee, QRDocumentType, Company, User, CompanyServices, Plan } from '../../types/index';
import { MODULE_TITLES } from '../../constants/index';
import { plansData } from '../auth/SubscriptionPage';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ChipGroup } from '../../components/common/ChipGroup';
import { EditIcon, TrashIcon } from '../../components/common/Icons';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import PageLayout from '../../components/layout/PageLayout';

const serviceOptions = [
  { value: QRDocumentType.Elevators, label: MODULE_TITLES.QR_ELEVATORS },
  { value: QRDocumentType.WaterHeaters, label: MODULE_TITLES.QR_WATER_HEATERS },
  { value: QRDocumentType.FireSafetySystem, label: MODULE_TITLES.QR_FIRE_SAFETY },
  { value: QRDocumentType.DetectionSystem, label: MODULE_TITLES.QR_DETECTION },
  { value: QRDocumentType.ElectricalInstallations, label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS },
];
const serviceLabelToValueMap = new Map(serviceOptions.map(o => [o.label, o.value]));
const serviceValueToLabelMap = new Map(serviceOptions.map(o => [o.value, o.label]));

interface CompanyFormData {
  name: string;
  cuit: string;
  address: string;
  services: QRDocumentType[];
  postalCode: string;
  city: string;
  province: string;
  country: string;
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingAction, setBillingAction] = useState<'change' | 'cancel'>('change');
  const { currentUser, currentCompany, refreshCompany, updateUserDetails, logout, changePlan, cancelSubscription } = useAuth();

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

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany || !isCompanyFormValid()) {
        setError('Por favor, corrija los errores en el formulario.');
        return
    };
    setIsLoading(true); setError('');
    try {
      const services: CompanyServices = (companyForm.services || []).reduce((acc, service) => {
        acc[service] = true;
        return acc;
      }, {} as CompanyServices);

      await api.updateCompany({ ...currentCompany, ...companyForm, services });
      await refreshCompany();
      setIsEditingCompany(false);
      alert('Información de empresa actualizada');
    } catch (err) {
      setError((err as Error).message || 'Error al actualizar la empresa');
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
    } catch (err) {
      setError((err as Error).message || 'Error al guardar el empleado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (currentUser?.email === employee.email) {
      alert('No puedes eliminar tu propia cuenta.'); return;
    }
    if ((currentCompany?.employees?.length ?? 0) <= 1) {
      alert("No se puede eliminar al único empleado."); return;
    }
    if (!window.confirm('¿Está seguro de que desea eliminar este empleado?')) return;
    setIsLoading(true); setError('');
    try {
      await api.deleteEmployee(employee.id);
      await refreshCompany();
    } catch (err) {
      setError((err as Error).message || 'Error al eliminar el empleado');
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
      alert('Perfil actualizado.');
    } catch (err) {
      setError((err as Error).message || 'Error al actualizar el perfil.');
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
      alert('Se ha enviado un enlace para restablecer la contraseña a su correo electrónico.');
    } catch (err) {
      setError((err as Error).message || 'Error al enviar el correo electrónico.');
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
        await changePlan(newSelectedPlanId);
      } else {
        if (!window.confirm('¿Está seguro de que desea cancelar su suscripción?')) {
            setIsLoading(false);
            return
        };
        await cancelSubscription();
      }
      setShowBillingModal(false);
      await refreshCompany();
    } catch (err) {
      setError((err as Error).message || `Error al ${billingAction === 'change' ? 'cambiar de plan' : 'cancelar la suscripción'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const tabs = [
    { id: 'company', label: 'Empresa' },
    { id: 'employees', label: 'Empleados' },
    { id: 'billing', label: 'Facturación' },
    { id: 'profile', label: 'Mi Perfil' }
  ];

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

  const footerContent = useMemo(() => {
    switch (activeTab) {
        case 'company':
            return isEditingCompany ? (
                <div className="w-full flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={handleCancelCompanyEdit}>Cancelar</Button>
                    <Button type="submit" form="company-form" loading={isLoading} disabled={!isCompanyFormValid()}>Guardar cambios</Button>
                </div>
            ) : (
                <Button type="button" onClick={() => setIsEditingCompany(true)}>
                    <EditIcon className="w-4 h-4 mr-2" />
                    Editar información
                </Button>
            );
        case 'profile':
            return isEditingProfile ? (
                <div className="w-full flex justify-between">
                    <Button type="button" variant="danger" onClick={logout}>Cerrar sesión</Button>
                    <div className="flex space-x-3">
                        <Button type="button" variant="outline" onClick={handleCancelProfileEdit}>Cancelar</Button>
                        <Button type="submit" form="profile-form" loading={isLoading}>Guardar cambios</Button>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-between">
                    <Button type="button" variant="danger" onClick={logout}>Cerrar sesión</Button>
                    <Button type="button" onClick={() => setIsEditingProfile(true)}>
                        <EditIcon className="w-4 h-4 mr-2" />
                        Editar perfil
                    </Button>
                </div>
            );
        default:
            return null;
    }
  }, [activeTab, isLoading, companyFormErrors, isEditingCompany, isEditingProfile]);

  if (!currentCompany || !currentUser) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <PageLayout title="Configuración" footer={footerContent}>
        <div className="flex flex-col h-full">
            <div className="border-b border-gray-200 flex-shrink-0">
                <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >{tab.label}</button>
                ))}
                </nav>
            </div>
            
            <div className="flex-grow pt-6 min-h-0">
                {activeTab === 'company' && (
                    isEditingCompany ? (
                        <form id="company-form" onSubmit={handleCompanySubmit} className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-900">Información de la empresa</h2>
                            <div className="space-y-4">
                                 <Input id="companyName" label="Nombre de la empresa" name="name" value={companyForm.name || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.name} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input id="companyCuit" label="CUIT" name="cuit" value={companyForm.cuit || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.cuit} maxLength={13} />
                                    <Input id="companyPostalCode" label="Código Postal" name="postalCode" value={companyForm.postalCode || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.postalCode} />
                                </div>
                                <Input id="companyAddress" label="Dirección" name="address" value={companyForm.address || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.address} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Input id="companyCity" label="Ciudad" name="city" value={companyForm.city || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.city} />
                                    <Input id="companyProvince" label="Provincia" name="province" value={companyForm.province || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.province} />
                                    <Input id="companyCountry" label="País" name="country" value={companyForm.country || ''} onChange={handleCompanyFormChange} required error={companyFormErrors.country} />
                                </div>
                            </div>
                            <div>
                                <ChipGroup
                                    label="Servicios Requeridos"
                                    options={serviceOptions.map(o => o.label)}
                                    selectedOptions={(companyForm.services || []).map(v => serviceValueToLabelMap.get(v)!)}
                                    onChange={(selectedLabels) => {
                                        const newValues = selectedLabels.map(label => serviceLabelToValueMap.get(label)!);
                                        setCompanyForm(prev => ({ ...prev, services: newValues }));
                                    }}
                                />
                            </div>
                            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-900">Información de la empresa</h2>
                            <Card>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nombre de la empresa</p>
                                        <p className="text-base text-gray-900">{currentCompany.name}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">CUIT</p>
                                            <p className="text-base text-gray-900">{currentCompany.cuit}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Código Postal</p>
                                            <p className="text-base text-gray-900">{currentCompany.postalCode}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dirección</p>
                                        <p className="text-base text-gray-900">{currentCompany.address}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Ciudad</p>
                                            <p className="text-base text-gray-900">{currentCompany.city}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Provincia</p>
                                            <p className="text-base text-gray-900">{currentCompany.province}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">País</p>
                                            <p className="text-base text-gray-900">{currentCompany.country}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Servicios Contratados</p>
                                        <div className="flex flex-wrap gap-2">
                                            {currentCompany.services && Object.entries(currentCompany.services).filter(([_, enabled]) => enabled).map(([service]) => (
                                                <span key={service} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {serviceValueToLabelMap.get(service as QRDocumentType)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )
                )}
                
                {activeTab === 'employees' && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6 flex-shrink-0">
                            <h2 className="text-lg font-medium text-gray-900">Empleados</h2>
                            <Button onClick={() => openEmployeeModal()}>Agregar empleado</Button>
                        </div>
                        <div className="overflow-y-auto flex-grow min-h-0 border border-gray-200 rounded-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentCompany.employees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{employee.name}</td>
                                            <td className="px-4 py-3 text-sm">{employee.email}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.role === 'Administrador' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {employee.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEmployeeModal(employee)} disabled={isLoading}><EditIcon /></Button>
                                                {currentUser.email !== employee.email && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee)} className="text-red-600 hover:bg-red-100" disabled={isLoading}><TrashIcon /></Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-medium text-gray-900">Facturación</h2>
                        <Card>
                            <h3 className="font-medium text-gray-900">Plan actual</h3>
                            <p className="text-sm text-gray-600">
                                Plan {currentCompany.selectedPlan} - {plansData.find(p => p.id === currentCompany.selectedPlan)?.price}/mes
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {currentCompany.subscriptionStatus === 'canceled' 
                                    ? <span className="text-red-600 font-semibold">Cancelado</span>
                                    : `Próxima facturación: ${currentCompany.subscriptionRenewalDate ? new Date(currentCompany.subscriptionRenewalDate).toLocaleDateString() : 'N/A'}`
                                }
                            </p>
                        </Card>
                        <div className="flex space-x-4">
                            <Button variant="outline" onClick={() => { setBillingAction('change'); setShowBillingModal(true); }}>Cambiar plan</Button>
                            {currentCompany.subscriptionStatus !== 'canceled' &&
                            <Button variant="danger" onClick={() => { setBillingAction('cancel'); setShowBillingModal(true); }}>Cancelar suscripción</Button>
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    isEditingProfile ? (
                        <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-6">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Mi Perfil</h2>
                                <Input id="profileName" label="Nombre completo" value={profileForm.name} onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))} required className="mt-4" />
                                <Input id="profileEmail" label="Email" value={profileForm.email} disabled className="mt-4"/>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-base font-medium text-gray-900">Seguridad de la Cuenta</h3>
                                <p className="text-sm text-gray-500 mt-1">Para cambiar su contraseña, le enviaremos un enlace seguro a su correo electrónico.</p>
                                <Button type="button" variant="outline" onClick={handlePasswordReset} loading={isPasswordResetLoading} className="mt-4">
                                    Enviar enlace para restablecer contraseña
                                </Button>
                            </div>
                            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-900">Mi Perfil</h2>
                            <Card>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nombre completo</p>
                                        <p className="text-base text-gray-900">{currentUser.name}</p>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-base text-gray-900">{currentUser.email}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="space-y-3">
                                    <h3 className="text-base font-medium text-gray-900">Seguridad de la Cuenta</h3>
                                    <p className="text-sm text-gray-600">Para cambiar su contraseña, le enviaremos un enlace seguro a su correo electrónico.</p>
                                    <Button type="button" variant="outline" onClick={handlePasswordReset} loading={isPasswordResetLoading} className="mt-2">
                                        Enviar enlace para restablecer contraseña
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )
                )}
            </div>
        </div>
            
        <Modal isOpen={showEmployeeModal} onClose={() => setShowEmployeeModal(false)} title={editingEmployee ? 'Editar empleado' : 'Agregar empleado'}>
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <Input id="empName" label="Nombre" value={employeeForm.name} onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))} required />
            <Input id="empEmail" label="Email" type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))} required />
            <Input id="empRole" label="Rol" value={employeeForm.role} onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))} required placeholder="Ej: Administrador, Usuario" />
            <div className="flex justify-end space-x-4 pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowEmployeeModal(false)}>Cancelar</Button>
                <Button type="submit" loading={isLoading}>{editingEmployee ? 'Guardar' : 'Agregar'}</Button>
            </div>
            </form>
        </Modal>

        <Modal isOpen={showBillingModal} onClose={() => setShowBillingModal(false)} title={billingAction === 'change' ? 'Cambiar plan' : 'Cancelar suscripción'}>
            <div className="space-y-4">
            <p className="text-gray-600">
                {billingAction === 'change' ? 'Selecciona un nuevo plan para tu suscripción.' : '¿Estás seguro de que deseas cancelar tu suscripción? Perderás el acceso a las funciones al final de tu ciclo de facturación actual.'}
            </p>
            {billingAction === 'change' && (
                <div className="space-y-2">
                {plansData.map((plan) => (
                    <div key={plan.id} className={`border rounded-lg p-3 cursor-pointer ${newSelectedPlanId === plan.id ? 'border-blue-600 ring-2 ring-blue-500' : 'border-gray-300'}`} onClick={() => setNewSelectedPlanId(plan.id)}>
                    <div className="flex justify-between items-center">
                        <div>
                        <h3 className="font-medium">{plan.name}</h3>
                        <p className="text-sm text-gray-500">{plan.price}/mes</p>
                        </div>
                        <input type="radio" name="plan" value={plan.id} checked={newSelectedPlanId === plan.id} readOnly className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                    </div>
                    </div>
                ))}
                </div>
            )}
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <div className="flex justify-end space-x-4 pt-4 mt-2">
                <Button variant="outline" onClick={() => setShowBillingModal(false)}>Cancelar</Button>
                <Button variant={billingAction === 'cancel' ? 'danger' : 'primary'} onClick={handleBillingAction} loading={isLoading}>
                {billingAction === 'change' ? 'Cambiar plan' : 'Confirmar Cancelación'}
                </Button>
            </div>
            </div>
        </Modal>
    </PageLayout>
  );
};

export default SettingsPage;