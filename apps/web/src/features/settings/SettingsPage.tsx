import { useSettingsData } from './hooks/useSettingsData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CompanyInfoSection } from './components/CompanyInfoSection';
import { EmployeeSection } from './components/EmployeeSection';
import { BillingSection } from './components/BillingSection';
import { ProfileSection } from './components/ProfileSection';
import { EmployeeModal } from './components/EmployeeModal';
import { SkeletonForm } from '../../components/common/SkeletonLoader';
import PageLayout from '../../components/layout/PageLayout';

export const SettingsPage = () => {
  const data = useSettingsData();

  if (!data.currentCompany || !data.currentUser) {
    return <SkeletonForm />;
  }

  return (
    <PageLayout title="Configuración">
      <Tabs value={data.activeTab} onValueChange={data.setActiveTab}>
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="pt-4">
          <CompanyInfoSection
            currentCompany={data.currentCompany}
            isEditing={data.isEditingCompany}
            setIsEditing={data.setIsEditingCompany}
            onSubmit={data.handleCompanySubmit}
            isLoading={data.isLoading}
            error={data.error}
            onCancel={data.handleCancelCompanyEdit}
          />
        </TabsContent>

        <TabsContent value="employees" className="pt-4">
          <EmployeeSection
            currentCompany={data.currentCompany}
            currentUser={data.currentUser}
            isLoading={data.isLoading}
            openEmployeeModal={data.openEmployeeModal}
            handleDeleteEmployee={data.handleDeleteEmployee}
          />
        </TabsContent>

        <TabsContent value="billing" className="pt-4">
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
        </TabsContent>

        <TabsContent value="profile" className="pt-4">
          <ProfileSection currentUser={data.currentUser} />
        </TabsContent>
      </Tabs>

      <EmployeeModal
        isOpen={data.showEmployeeModal}
        onClose={() => data.setShowEmployeeModal(false)}
        editingEmployee={data.editingEmployee}
        onSubmit={data.handleEmployeeSubmit}
        isLoading={data.isLoading}
      />
    </PageLayout>
  );
};

export default SettingsPage;
