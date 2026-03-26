import { Fragment, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import { ROUTE_PATHS } from './constants/index';
import { SpinnerPage } from './components/common/SpinnerPage';
import { LazyPages, QR_MODULE_ROUTES, PLACEHOLDER_ROUTES } from './routes/routes.config';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './features/admin/components/AdminLayout';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <ErrorBoundary>
          <Suspense fallback={<SpinnerPage />}>
            <Routes>
              {/* Auth Routes (Public) */}
              <Route path={ROUTE_PATHS.LOGIN} element={<LazyPages.LoginForm />} />
              <Route path={ROUTE_PATHS.REGISTER} element={<LazyPages.RegisterForm />} />
              <Route path={ROUTE_PATHS.AUTH_CALLBACK} element={<LazyPages.AuthCallbackPage />} />
              <Route path={ROUTE_PATHS.RESET_PASSWORD} element={<LazyPages.ResetPasswordPage />} />

              {/* Onboarding Routes (Protected, no layout) */}
              <Route
                path={ROUTE_PATHS.CREATE_COMPANY}
                element={
                  <ProtectedRoute>
                    <LazyPages.CreateCompanyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTE_PATHS.SUBSCRIPTION}
                element={
                  <ProtectedRoute>
                    <LazyPages.SubscriptionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTE_PATHS.TRIAL_EXPIRED}
                element={
                  <ProtectedRoute>
                    <LazyPages.TrialExpiredPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTE_PATHS.BANK_TRANSFER_UPLOAD}
                element={
                  <ProtectedRoute>
                    <LazyPages.BankTransferUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTE_PATHS.BANK_TRANSFER_STATUS}
                element={
                  <ProtectedRoute>
                    <LazyPages.BankTransferStatusPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes (Admin-protected with admin layout) */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<LazyPages.AdminDashboardPage />} />
                        <Route path="schools" element={<LazyPages.AdminSchoolsPage />} />
                        <Route path="schools/:id" element={<LazyPages.AdminSchoolDetailPage />} />
                        <Route path="payments" element={<LazyPages.AdminPaymentsPage />} />
                        <Route path="activity" element={<LazyPages.AdminActivityPage />} />
                        <Route path="metrics" element={<LazyPages.AdminMetricsPage />} />
                        <Route path="plans" element={<LazyPages.AdminPlansPage />} />
                        <Route
                          path="*"
                          element={
                            <div className="text-center py-10">
                              <h1 className="text-2xl font-semibold">404 - Página no encontrada</h1>
                            </div>
                          }
                        />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                }
              />

              {/* Main Application Routes (Protected with layout) */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Routes>
                        {/* Dashboard */}
                        <Route
                          path="/"
                          element={<Navigate to={ROUTE_PATHS.DASHBOARD.substring(1)} replace />}
                        />
                        <Route
                          path={ROUTE_PATHS.DASHBOARD.substring(1)}
                          element={<LazyPages.DashboardPage />}
                        />

                        {/* Conservation Certificates */}
                        <Route
                          path={ROUTE_PATHS.CONSERVATION_CERTIFICATES.substring(1)}
                          element={<LazyPages.ConservationCertificateListPage />}
                        />
                        <Route
                          path={ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE.substring(1)}
                          element={<LazyPages.CreateEditConservationCertificatePage />}
                        />
                        <Route
                          path={ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.substring(1)}
                          element={<LazyPages.CreateEditConservationCertificatePage />}
                        />

                        {/* Self Protection Systems */}
                        <Route
                          path={ROUTE_PATHS.SELF_PROTECTION_SYSTEMS.substring(1)}
                          element={<LazyPages.SelfProtectionSystemListPage />}
                        />
                        <Route
                          path={ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM.substring(1)}
                          element={<LazyPages.CreateEditSelfProtectionSystemPage />}
                        />
                        <Route
                          path={ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.substring(1)}
                          element={<LazyPages.CreateEditSelfProtectionSystemPage />}
                        />

                        {/* QR Module Routes - Dynamically generated */}
                        {QR_MODULE_ROUTES.map((qrModule) => (
                          <Fragment key={qrModule.type}>
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
                          </Fragment>
                        ))}

                        {/* Event Information */}
                        <Route
                          path={ROUTE_PATHS.EVENT_INFORMATION.substring(1)}
                          element={<LazyPages.EventInformationListPage />}
                        />
                        <Route
                          path={ROUTE_PATHS.NEW_EVENT_INFORMATION.substring(1)}
                          element={<LazyPages.CreateEditEventInformationPage />}
                        />
                        <Route
                          path={ROUTE_PATHS.EDIT_EVENT_INFORMATION.substring(1)}
                          element={<LazyPages.CreateEditEventInformationPage />}
                        />

                        {/* Fire Extinguishers */}
                        <Route
                          path={ROUTE_PATHS.FIRE_EXTINGUISHERS.substring(1)}
                          element={<LazyPages.FireExtinguisherListPage />}
                        />
                        <Route
                          path={ROUTE_PATHS.NEW_FIRE_EXTINGUISHER.substring(1)}
                          element={<LazyPages.CreateEditFireExtinguisherPage />}
                        />
                        <Route
                          path={ROUTE_PATHS.EDIT_FIRE_EXTINGUISHER.substring(1)}
                          element={<LazyPages.CreateEditFireExtinguisherPage />}
                        />

                        {/* Settings & Notifications */}
                        <Route
                          path={ROUTE_PATHS.SETTINGS.substring(1)}
                          element={<LazyPages.SettingsPage />}
                        />
                        <Route
                          path={ROUTE_PATHS.NOTIFICATIONS.substring(1)}
                          element={<LazyPages.NotificationsPage />}
                        />

                        {/* Placeholder Routes - Dynamically generated */}
                        {PLACEHOLDER_ROUTES.map((placeholder) => (
                          <Route
                            key={placeholder.path}
                            path={placeholder.path.substring(1)}
                            element={<LazyPages.PlaceholderPage title={placeholder.title} />}
                          />
                        ))}

                        {/* 404 */}
                        <Route
                          path="*"
                          element={
                            <div className="text-center py-10">
                              <h1 className="text-2xl text-content">404 - Página no encontrada</h1>
                            </div>
                          }
                        />
                      </Routes>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
