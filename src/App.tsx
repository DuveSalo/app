
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROUTE_PATHS, MODULE_TITLES } from './constants/index';
import { QRDocumentType } from './types/index';
import SpinnerPage from './components/common/SpinnerPage';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Page Components - Statically imported to debug module resolution issues
import AuthPage from './features/auth/AuthPage';
import CreateCompanyPage from './features/auth/CreateCompanyPage';
import SubscriptionPage from './features/auth/SubscriptionPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ConservationCertificateListPage from './features/conservation-certificates/ConservationCertificateListPage';
import CreateEditConservationCertificatePage from './features/conservation-certificates/CreateEditConservationCertificatePage';
import SelfProtectionSystemListPage from './features/self-protection-systems/SelfProtectionSystemListPage';
import CreateEditSelfProtectionSystemPage from './features/self-protection-systems/CreateEditSelfProtectionSystemPage';
import QRModuleListPage from './features/qr/QRModuleListPage';
import UploadQRDocumentPage from './features/qr/UploadQRDocumentPage';
import EventInformationListPage from './features/event-information/EventInformationListPage';
import CreateEditEventInformationPage from './features/event-information/CreateEditEventInformationPage';
import SettingsPage from './features/settings/SettingsPage';
import PlaceholderPage from './features/placeholders/PlaceholderPage';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<SpinnerPage />}>
        <Routes>
          <Route path={ROUTE_PATHS.LOGIN} element={<AuthPage mode="login" />} />
          <Route path={ROUTE_PATHS.REGISTER} element={<AuthPage mode="register" />} />
          
          <Route 
            path={ROUTE_PATHS.CREATE_COMPANY} 
            element={<ProtectedRoute><CreateCompanyPage /></ProtectedRoute>} 
          />
          <Route 
            path={ROUTE_PATHS.SUBSCRIPTION} 
            element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} 
          />

          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to={ROUTE_PATHS.DASHBOARD.substring(1)} replace />} />
                  <Route path={ROUTE_PATHS.DASHBOARD.substring(1)} element={<DashboardPage />} />
                  
                  <Route path={ROUTE_PATHS.CONSERVATION_CERTIFICATES.substring(1)} element={<ConservationCertificateListPage />} />
                  <Route path={ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE.substring(1)} element={<CreateEditConservationCertificatePage />} />
                  <Route path={ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.substring(1)} element={<CreateEditConservationCertificatePage />} />

                  <Route path={ROUTE_PATHS.SELF_PROTECTION_SYSTEMS.substring(1)} element={<SelfProtectionSystemListPage />} />
                  <Route path={ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM.substring(1)} element={<CreateEditSelfProtectionSystemPage />} />
                  <Route path={ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.substring(1)} element={<CreateEditSelfProtectionSystemPage />} />
                  
                  <Route path={ROUTE_PATHS.QR_ELEVATORS.substring(1)} element={<QRModuleListPage qrType={QRDocumentType.Elevators} title={MODULE_TITLES.QR_ELEVATORS} uploadPath={ROUTE_PATHS.UPLOAD_QR_ELEVATORS}/>} />
                  <Route path={ROUTE_PATHS.UPLOAD_QR_ELEVATORS.substring(1)} element={<UploadQRDocumentPage qrType={QRDocumentType.Elevators} title={MODULE_TITLES.QR_ELEVATORS} listPath={ROUTE_PATHS.QR_ELEVATORS} />} />
                  
                  <Route path={ROUTE_PATHS.QR_WATER_HEATERS.substring(1)} element={<QRModuleListPage qrType={QRDocumentType.WaterHeaters} title={MODULE_TITLES.QR_WATER_HEATERS} uploadPath={ROUTE_PATHS.UPLOAD_QR_WATER_HEATERS} />} />
                  <Route path={ROUTE_PATHS.UPLOAD_QR_WATER_HEATERS.substring(1)} element={<UploadQRDocumentPage qrType={QRDocumentType.WaterHeaters} title={MODULE_TITLES.QR_WATER_HEATERS} listPath={ROUTE_PATHS.QR_WATER_HEATERS} />} />

                  <Route path={ROUTE_PATHS.QR_FIRE_SAFETY.substring(1)} element={<QRModuleListPage qrType={QRDocumentType.FireSafetySystem} title={MODULE_TITLES.QR_FIRE_SAFETY} uploadPath={ROUTE_PATHS.UPLOAD_QR_FIRE_SAFETY} />} />
                  <Route path={ROUTE_PATHS.UPLOAD_QR_FIRE_SAFETY.substring(1)} element={<UploadQRDocumentPage qrType={QRDocumentType.FireSafetySystem} title={MODULE_TITLES.QR_FIRE_SAFETY} listPath={ROUTE_PATHS.QR_FIRE_SAFETY} />} />

                  <Route path={ROUTE_PATHS.QR_DETECTION.substring(1)} element={<QRModuleListPage qrType={QRDocumentType.DetectionSystem} title={MODULE_TITLES.QR_DETECTION} uploadPath={ROUTE_PATHS.UPLOAD_QR_DETECTION} />} />
                  <Route path={ROUTE_PATHS.UPLOAD_QR_DETECTION.substring(1)} element={<UploadQRDocumentPage qrType={QRDocumentType.DetectionSystem} title={MODULE_TITLES.QR_DETECTION} listPath={ROUTE_PATHS.QR_DETECTION} />} />
                  
                  <Route path={ROUTE_PATHS.ELECTRICAL_INSTALLATIONS.substring(1)} element={<QRModuleListPage qrType={QRDocumentType.ElectricalInstallations} title={MODULE_TITLES.ELECTRICAL_INSTALLATIONS} uploadPath={ROUTE_PATHS.UPLOAD_ELECTRICAL_INSTALLATIONS}/>} />
                  <Route path={ROUTE_PATHS.UPLOAD_ELECTRICAL_INSTALLATIONS.substring(1)} element={<UploadQRDocumentPage qrType={QRDocumentType.ElectricalInstallations} title={MODULE_TITLES.ELECTRICAL_INSTALLATIONS} listPath={ROUTE_PATHS.ELECTRICAL_INSTALLATIONS} />} />

                  <Route path={ROUTE_PATHS.EVENT_INFORMATION.substring(1)} element={<EventInformationListPage />} />
                  <Route path={ROUTE_PATHS.NEW_EVENT_INFORMATION.substring(1)} element={<CreateEditEventInformationPage />} />
                  <Route path={ROUTE_PATHS.EDIT_EVENT_INFORMATION.substring(1)} element={<CreateEditEventInformationPage />} />
                  
                  <Route path={ROUTE_PATHS.SETTINGS.substring(1)} element={<SettingsPage />} />

                  <Route path={ROUTE_PATHS.WATER_TANKS.substring(1)} element={<PlaceholderPage title={MODULE_TITLES.WATER_TANKS} />} />
                  <Route path={ROUTE_PATHS.PLANT_SPECIES.substring(1)} element={<PlaceholderPage title={MODULE_TITLES.PLANT_SPECIES} />} />
                  <Route path={ROUTE_PATHS.SANITIZATION.substring(1)} element={<PlaceholderPage title={MODULE_TITLES.SANITIZATION} />} />
                  
                  <Route path="*" element={<div className="text-center py-10"><h1 className="text-2xl text-content">404 - Página no encontrada</h1></div>} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }/>
        </Routes>
        </Suspense>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;