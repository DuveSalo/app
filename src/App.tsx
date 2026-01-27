
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROUTE_PATHS } from './constants/index';
import { SpinnerPage } from './components/common/SpinnerPage';
import { LazyPages, QR_MODULE_ROUTES, PLACEHOLDER_ROUTES } from './routes/routes.config';

// Layouts
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<SpinnerPage />}>
            <Routes>
              {/* Auth Routes (Public) */}
              <Route path={ROUTE_PATHS.LOGIN} element={<LazyPages.AuthPage mode="login" />} />
              <Route path={ROUTE_PATHS.REGISTER} element={<LazyPages.AuthPage mode="register" />} />
              <Route path="/auth/callback" element={<LazyPages.AuthCallbackPage />} />

              {/* Onboarding Routes (Protected, no layout) */}
              <Route
                path={ROUTE_PATHS.CREATE_COMPANY}
                element={<ProtectedRoute><LazyPages.CreateCompanyPage /></ProtectedRoute>}
              />
              <Route
                path={ROUTE_PATHS.SUBSCRIPTION}
                element={<ProtectedRoute><LazyPages.SubscriptionPage /></ProtectedRoute>}
              />

              {/* Main Application Routes (Protected with layout) */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      {/* Dashboard */}
                      <Route path="/" element={<Navigate to={ROUTE_PATHS.DASHBOARD.substring(1)} replace />} />
                      <Route path={ROUTE_PATHS.DASHBOARD.substring(1)} element={<LazyPages.DashboardPage />} />

                      {/* Conservation Certificates */}
                      <Route path={ROUTE_PATHS.CONSERVATION_CERTIFICATES.substring(1)} element={<LazyPages.ConservationCertificateListPage />} />
                      <Route path={ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE.substring(1)} element={<LazyPages.CreateEditConservationCertificatePage />} />
                      <Route path={ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.substring(1)} element={<LazyPages.CreateEditConservationCertificatePage />} />

                      {/* Self Protection Systems */}
                      <Route path={ROUTE_PATHS.SELF_PROTECTION_SYSTEMS.substring(1)} element={<LazyPages.SelfProtectionSystemListPage />} />
                      <Route path={ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM.substring(1)} element={<LazyPages.CreateEditSelfProtectionSystemPage />} />
                      <Route path={ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.substring(1)} element={<LazyPages.CreateEditSelfProtectionSystemPage />} />

                      {/* QR Module Routes - Dynamically generated */}
                      {QR_MODULE_ROUTES.map((qrModule) => (
                        <React.Fragment key={qrModule.type}>
                          <Route
                            path={qrModule.listPath.substring(1)}
                            element={
                              <LazyPages.QRModuleListPage
                                qrType={qrModule.type}
                                title={qrModule.title}
                                uploadPath={qrModule.uploadPath}
                                editPath={qrModule.editPath}
                              />
                            }
                          />
                          <Route
                            path={qrModule.uploadPath.substring(1)}
                            element={
                              <LazyPages.UploadQRDocumentPage
                                qrType={qrModule.type}
                                title={qrModule.title}
                                listPath={qrModule.listPath}
                              />
                            }
                          />
                          <Route
                            path={qrModule.editPath.substring(1)}
                            element={
                              <LazyPages.EditQRDocumentPage
                                qrType={qrModule.type}
                                title={qrModule.title}
                                listPath={qrModule.listPath}
                              />
                            }
                          />
                        </React.Fragment>
                      ))}

                      {/* Event Information */}
                      <Route path={ROUTE_PATHS.EVENT_INFORMATION.substring(1)} element={<LazyPages.EventInformationListPage />} />
                      <Route path={ROUTE_PATHS.NEW_EVENT_INFORMATION.substring(1)} element={<LazyPages.CreateEditEventInformationPage />} />
                      <Route path={ROUTE_PATHS.EDIT_EVENT_INFORMATION.substring(1)} element={<LazyPages.CreateEditEventInformationPage />} />

                      {/* Fire Extinguishers */}
                      <Route path={ROUTE_PATHS.FIRE_EXTINGUISHERS.substring(1)} element={<LazyPages.FireExtinguisherListPage />} />
                      <Route path={ROUTE_PATHS.NEW_FIRE_EXTINGUISHER.substring(1)} element={<LazyPages.CreateEditFireExtinguisherPage />} />
                      <Route path={ROUTE_PATHS.EDIT_FIRE_EXTINGUISHER.substring(1)} element={<LazyPages.CreateEditFireExtinguisherPage />} />

                      {/* Settings & Notifications */}
                      <Route path={ROUTE_PATHS.SETTINGS.substring(1)} element={<LazyPages.SettingsPage />} />
                      <Route path={ROUTE_PATHS.NOTIFICATIONS.substring(1)} element={<LazyPages.NotificationsPage />} />

                      {/* Placeholder Routes - Dynamically generated */}
                      {PLACEHOLDER_ROUTES.map((placeholder) => (
                        <Route
                          key={placeholder.path}
                          path={placeholder.path.substring(1)}
                          element={<LazyPages.PlaceholderPage title={placeholder.title} />}
                        />
                      ))}

                      {/* 404 */}
                      <Route path="*" element={<div className="text-center py-10"><h1 className="text-2xl text-content">404 - Página no encontrada</h1></div>} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;