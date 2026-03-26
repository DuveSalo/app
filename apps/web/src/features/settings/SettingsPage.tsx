import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCompanySettings } from './hooks/useCompanySettings';
import { useEmployeeManagement } from './hooks/useEmployeeManagement';
import { useBillingData } from './hooks/useBillingData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CompanyInfoSection } from './components/CompanyInfoSection';
import { EmployeeSection } from './components/EmployeeSection';
import { BillingSection } from './components/BillingSection';
import { ProfileSection } from './components/ProfileSection';
import { EmployeeModal } from './components/EmployeeModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SkeletonForm } from '../../components/common/SkeletonLoader';
import PageLayout from '../../components/layout/PageLayout';

const VALID_TABS = ['company', 'employees', 'billing', 'profile'];

export const SettingsPage = () => {
  const { currentUser, currentCompany } = useAuth();
  const [searchParams] = useSearchParams();

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : 'company'
  );

  const company = useCompanySettings();
  const employees = useEmployeeManagement();
  const billing = useBillingData();

  // Sync fresh data from MercadoPago when viewing billing tab
  useEffect(() => {
    if (activeTab === 'billing') {
      billing.syncMercadoPagoStatus();
    }
  }, [activeTab, billing.subscription?.mpPreapprovalId, billing.subscription?.status]);

  if (!currentCompany || !currentUser) {
    return <SkeletonForm />;
  }

  return (
    <PageLayout title="Configuración">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="pt-4">
          <CompanyInfoSection
            currentCompany={currentCompany}
            isEditing={company.isEditingCompany}
            setIsEditing={company.setIsEditingCompany}
            onSubmit={company.handleCompanySubmit}
            isLoading={company.isLoading}
            error={company.error}
            onCancel={company.handleCancelCompanyEdit}
          />
        </TabsContent>

        <TabsContent value="employees" className="pt-4">
          <EmployeeSection
            currentCompany={currentCompany}
            currentUser={currentUser}
            isLoading={employees.isLoading}
            openEmployeeModal={employees.openEmployeeModal}
            handleDeleteEmployee={employees.requestDeleteEmployee}
          />
        </TabsContent>

        <TabsContent value="billing" className="pt-4">
          <BillingSection
            companyId={currentCompany.id}
            subscription={billing.subscription}
            payments={billing.payments}
            isLoading={billing.isLoading}
            onCancel={billing.handleCancelSubscription}
            onReactivate={billing.handleReactivateSubscription}
            onSubscriptionChange={billing.handleSubscriptionChange}
            onChangePlan={billing.handleChangePlan}
            onChangeCard={billing.handleChangeCard}
            onCreateSubscription={billing.handleCreateSubscription}
            onBankTransferPayment={billing.handleBankTransferPayment}
            userEmail={currentUser.email}
            trialEndsAt={currentCompany.trialEndsAt}
            cardBrand={billing.cardBrand}
            cardLastFour={billing.cardLastFour}
          />
        </TabsContent>

        <TabsContent value="profile" className="pt-4">
          <ProfileSection currentUser={currentUser} />
        </TabsContent>
      </Tabs>

      <EmployeeModal
        isOpen={employees.showEmployeeModal}
        onClose={() => employees.setShowEmployeeModal(false)}
        editingEmployee={employees.editingEmployee}
        onSubmit={employees.handleEmployeeSubmit}
        isLoading={employees.isLoading}
      />

      <ConfirmDialog
        isOpen={!!employees.deleteTarget}
        onClose={employees.cancelDeleteEmployee}
        onConfirm={employees.confirmDeleteEmployee}
        title="¿Eliminar empleado?"
        message={`Se eliminará a ${employees.deleteTarget?.name ?? 'este empleado'} del sistema. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={employees.isLoading}
      />
    </PageLayout>
  );
};

export default SettingsPage;
