import { useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { useSettingsData } from './hooks/useSettingsData';
import { CompanyInfoSection } from './components/CompanyInfoSection';
import { EmployeeSection } from './components/EmployeeSection';
import { BillingSection } from './components/BillingSection';
import { ProfileSection } from './components/ProfileSection';
import { EmployeeModal } from './components/EmployeeModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import PageLayout from '../../components/layout/PageLayout';
import { Tabs } from '../../components/common/Tabs';

export const SettingsPage = () => {
  const data = useSettingsData();

  const tabIndex = data.activeTab === 'company' ? 0
    : data.activeTab === 'employees' ? 1
    : data.activeTab === 'billing' ? 2
    : 3;

  const handleTabClick = (index: number) => {
    const tabIds = ['company', 'employees', 'billing', 'profile'];
    data.setActiveTab(tabIds[index]);
  };

  const footerContent = useMemo(() => {
    switch (data.activeTab) {
      case 'company':
        return data.isEditingCompany ? (
          <div className="w-full flex justify-end gap-3">
            <button
              type="button"
              onClick={data.handleCancelCompanyEdit}
              className="flex items-center gap-2 h-9 px-5 border border-neutral-200 text-sm font-medium text-neutral-900 rounded-md focus:outline-none hover:bg-neutral-50 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-neutral-400" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={data.handleCompanySubmit}
              disabled={data.isLoading || !data.isCompanyFormValid()}
              className="flex items-center gap-2 h-9 px-5 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none disabled:opacity-50 hover:bg-neutral-800 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Guardar cambios
            </button>
          </div>
        ) : null;
      case 'profile':
        return data.isEditingProfile ? (
          <div className="w-full flex justify-end gap-3">
            <button
              type="button"
              onClick={data.handleCancelProfileEdit}
              className="flex items-center gap-2 h-9 px-5 border border-neutral-200 text-sm font-medium text-neutral-900 rounded-md focus:outline-none hover:bg-neutral-50 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-neutral-400" />
              Cancelar
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={data.isLoading}
              className="flex items-center gap-2 h-9 px-5 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none disabled:opacity-50 hover:bg-neutral-800 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Guardar cambios
            </button>
          </div>
        ) : null;
      default:
        return null;
    }
  }, [data.activeTab, data.isLoading, data.isEditingCompany, data.isEditingProfile, data.handleCancelCompanyEdit, data.handleCompanySubmit, data.handleCancelProfileEdit, data.isCompanyFormValid]);

  if (!data.currentCompany || !data.currentUser) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  const settingsTabs = [
    {
      label: 'Empresa',
      content: (
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
      ),
    },
    {
      label: 'Empleados',
      content: (
        <EmployeeSection
          currentCompany={data.currentCompany}
          currentUser={data.currentUser}
          isLoading={data.isLoading}
          openEmployeeModal={data.openEmployeeModal}
          handleDeleteEmployee={data.handleDeleteEmployee}
        />
      ),
    },
    {
      label: 'Facturacion',
      content: (
        <BillingSection
          companyId={data.currentCompany.id}
          subscription={data.subscription}
          payments={data.payments}
          isLoading={data.isLoading}
          onCancel={data.handleCancelSubscription}
          onReactivate={data.handleReactivateSubscription}
          onSubscriptionChange={data.handleSubscriptionChange}
          onChangePlan={data.handleChangePlan}
          onCreateSubscription={data.handleCreateSubscription}
          userEmail={data.currentUser.email}
          trialEndsAt={data.currentCompany.trialEndsAt}
          cardBrand={data.cardBrand}
          cardLastFour={data.cardLastFour}
        />
      ),
    },
    {
      label: 'Mi Perfil',
      content: (
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
      ),
    },
  ];

  return (
    <PageLayout title="Configuracion" footer={footerContent}>
      <Tabs
        tabs={settingsTabs}
        activeTab={tabIndex}
        onTabClick={handleTabClick}
      />

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
