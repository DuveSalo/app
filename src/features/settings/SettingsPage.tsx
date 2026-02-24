import { useMemo } from 'react';
import { useSettingsData } from './hooks/useSettingsData';
import { CompanyInfoSection } from './components/CompanyInfoSection';
import { EmployeeSection } from './components/EmployeeSection';
import { BillingSection } from './components/BillingSection';
import { ProfileSection } from './components/ProfileSection';
import { EmployeeModal } from './components/EmployeeModal';
import { Button } from '../../components/common/Button';
import { EditIcon } from '../../components/common/Icons';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import PageLayout from '../../components/layout/PageLayout';

const tabs = [
  { id: 'company', label: 'Empresa' },
  { id: 'employees', label: 'Empleados' },
  { id: 'billing', label: 'Facturacion' },
  { id: 'profile', label: 'Mi Perfil' },
];

export const SettingsPage = () => {
  const data = useSettingsData();

  const footerContent = useMemo(() => {
    switch (data.activeTab) {
      case 'company':
        return data.isEditingCompany ? (
          <div className="w-full flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={data.handleCancelCompanyEdit}>Cancelar</Button>
            <Button type="button" onClick={data.handleCompanySubmit} loading={data.isLoading} disabled={!data.isCompanyFormValid()}>Guardar cambios</Button>
          </div>
        ) : null;
      case 'profile':
        return data.isEditingProfile ? (
          <div className="w-full flex justify-between">
            <Button type="button" variant="danger" onClick={data.logout}>Cerrar sesión</Button>
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={data.handleCancelProfileEdit}>Cancelar</Button>
              <Button type="submit" form="profile-form" loading={data.isLoading}>Guardar cambios</Button>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-between">
            <Button type="button" variant="danger" onClick={data.logout}>Cerrar sesión</Button>
            <Button type="button" onClick={() => data.setIsEditingProfile(true)}>
              <EditIcon className="w-4 h-4 mr-2" />
              Editar perfil
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, [data.activeTab, data.isLoading, data.isEditingCompany, data.isEditingProfile, data.handleCancelCompanyEdit, data.handleCompanySubmit, data.handleCancelProfileEdit, data.logout]);

  if (!data.currentCompany || !data.currentUser) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <PageLayout title="Configuración" footer={footerContent}>
      <div className="flex flex-col">
        <div className="border-b border-gray-200 flex-shrink-0 overflow-x-auto">
          <nav className="-mb-px flex space-x-2 sm:space-x-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => data.setActiveTab(tab.id)}
                className={`py-2 sm:py-2.5 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors focus:outline-none whitespace-nowrap ${data.activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >{tab.label}</button>
            ))}
          </nav>
        </div>

        <div className="pt-6">
          {data.activeTab === 'company' && (
            <CompanyInfoSection
              currentCompany={data.currentCompany}
              isEditing={data.isEditingCompany}
              setIsEditing={data.setIsEditingCompany}
              companyForm={data.companyForm}
              setCompanyForm={data.setCompanyForm}
              companyFormErrors={data.companyFormErrors}
              handleCompanyFormChange={data.handleCompanyFormChange}
              error={data.error}
            />
          )}
          {data.activeTab === 'employees' && (
            <EmployeeSection
              currentCompany={data.currentCompany}
              currentUser={data.currentUser}
              isLoading={data.isLoading}
              openEmployeeModal={data.openEmployeeModal}
              handleDeleteEmployee={data.handleDeleteEmployee}
            />
          )}
          {data.activeTab === 'billing' && (
            <BillingSection
              companyId={data.currentCompany.id}
              subscription={data.subscription}
              payments={data.payments}
              isLoading={data.isLoading}
              onCancel={data.handleCancelSubscription}
              onReactivate={data.handleReactivateSubscription}
              onSubscriptionChange={data.handleSubscriptionChange}
              onMpChangePlan={data.handleMpChangePlan}
              onPaypalChangePlan={data.handlePaypalChangePlan}
              onMpCreateSubscription={data.handleMpCreateSubscription}
              userEmail={data.currentUser.email}
              trialEndsAt={data.currentCompany.trialEndsAt}
            />
          )}
          {data.activeTab === 'profile' && (
            <ProfileSection
              currentUser={data.currentUser}
              isEditing={data.isEditingProfile}
              profileForm={data.profileForm}
              setProfileForm={data.setProfileForm}
              handleProfileSubmit={data.handleProfileSubmit}
              handlePasswordReset={data.handlePasswordReset}
              isPasswordResetLoading={data.isPasswordResetLoading}
              error={data.error}
            />
          )}
        </div>
      </div>

      <EmployeeModal
        isOpen={data.showEmployeeModal}
        onClose={() => data.setShowEmployeeModal(false)}
        editingEmployee={data.editingEmployee}
        employeeForm={data.employeeForm}
        setEmployeeForm={data.setEmployeeForm}
        handleSubmit={data.handleEmployeeSubmit}
        isLoading={data.isLoading}
      />
    </PageLayout>
  );
};

export default SettingsPage;
