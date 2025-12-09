import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  ShieldCheck,
  Flame,
  AlertTriangle,
  QrCode,
  Settings,
  ChevronsUpDown,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const { currentUser, currentCompany, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userInitials = useMemo(() => {
    if (currentUser?.name) {
      return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  }, [currentUser]);

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { path: ROUTE_PATHS.DASHBOARD, label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: ROUTE_PATHS.CONSERVATION_CERTIFICATES, label: MODULE_TITLES.CONSERVATION_CERTIFICATES, icon: <FileText className="w-5 h-5" /> },
    { path: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS, label: MODULE_TITLES.SELF_PROTECTION_SYSTEMS, icon: <ShieldCheck className="w-5 h-5" /> },
    { path: ROUTE_PATHS.FIRE_EXTINGUISHERS, label: MODULE_TITLES.FIRE_EXTINGUISHERS, icon: <Flame className="w-5 h-5" /> },
    { path: ROUTE_PATHS.EVENT_INFORMATION, label: MODULE_TITLES.EVENT_INFORMATION, icon: <AlertTriangle className="w-5 h-5" /> },
    { path: ROUTE_PATHS.ELECTRICAL_INSTALLATIONS, label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS, icon: <Zap className="w-5 h-5" /> },
  ];

  // Service navigation items (QR modules)
  const serviceNavItems: NavItem[] = useMemo(() => {
    const services = [
      { path: ROUTE_PATHS.QR_ELEVATORS, label: MODULE_TITLES.QR_ELEVATORS, service: QRDocumentType.Elevators },
      { path: ROUTE_PATHS.QR_WATER_HEATERS, label: MODULE_TITLES.QR_WATER_HEATERS, service: QRDocumentType.WaterHeaters },
      { path: ROUTE_PATHS.QR_FIRE_SAFETY, label: MODULE_TITLES.QR_FIRE_SAFETY, service: QRDocumentType.FireSafetySystem },
      { path: ROUTE_PATHS.QR_DETECTION, label: MODULE_TITLES.QR_DETECTION, service: QRDocumentType.DetectionSystem },
    ];

    return services
      .filter(item => currentCompany?.services?.[item.service])
      .map(item => ({
        path: item.path,
        label: item.label,
        icon: <QrCode className="w-5 h-5" />,
      }));
  }, [currentCompany?.services]);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    setIsUserMenuOpen(false);
    logout();
  };

  return (
    <>
      <aside className="w-64 hidden md:flex flex-col justify-between p-6 overflow-y-auto bg-[#F3F4F6]">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="relative flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-900">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">Escuela Segura</span>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                  isActive(item.path)
                    ? 'text-gray-900 bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-gray-700' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="text-left">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Services Section */}
          {serviceNavItems.length > 0 && (
            <div className="mt-8">
              <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider text-left">
                Servicios
              </p>
              <nav className="space-y-1">
                {serviceNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                      isActive(item.path)
                        ? 'text-gray-900 bg-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-gray-700' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className="text-left">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div>
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center justify-between p-2 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium">
                  {userInitials}
                </div>
                <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {currentUser?.name}
                </span>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 text-left">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Empresa</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{currentCompany?.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate(ROUTE_PATHS.SETTINGS);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configuracion
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="¿Deseas cerrar sesión?"
        message="Se cerrará tu sesión actual y tendrás que volver a iniciar sesión para acceder."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
};

export default Sidebar;
