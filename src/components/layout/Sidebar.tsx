import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  ShieldCheck,
  Flame,
  AlertTriangle,
  FolderOpen,
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
        icon: <FolderOpen className="w-5 h-5" />,
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
      <aside className="w-64 hidden md:flex flex-col justify-between py-3 bg-gray-100">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4 px-5">
            <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">Escuela Segura</span>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-0.5 px-3">
            {mainNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                  isActive(item.path)
                    ? 'text-gray-900 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
                <span className="text-left">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Services Section */}
          {serviceNavItems.length > 0 && (
            <div className="mt-4">
              <p className="px-5 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest text-left">
                Archivos
              </p>
              <nav className="space-y-0.5 px-3">
                {serviceNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                      isActive(item.path)
                        ? 'text-gray-900 bg-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="text-left">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="px-3">
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0 text-left">
                  <span className="text-sm font-medium text-gray-900 truncate block max-w-[120px]">
                    {currentUser?.name}
                  </span>
                  <span className="text-xs text-gray-400 truncate block max-w-[120px]">
                    {currentCompany?.name}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 text-left animate-fade-in">
                  <div className="px-3 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Empresa</p>
                    <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{currentCompany?.name}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate(ROUTE_PATHS.SETTINGS);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors rounded-md mx-0"
                    >
                      <Settings className="w-5 h-5" />
                      Configuración
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-md mx-0"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar sesión
                    </button>
                  </div>
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
