import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  FileText,
  ShieldCheck,
  Flame,
  AlertTriangle,
  FolderOpen,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import { ConfirmDialog } from '../common/ConfirmDialog';
import NotificationBell from './NotificationBell';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const MobileNav: React.FC = () => {
  const { currentUser, currentCompany, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    setIsOpen(false);
    logout();
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-900">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-base font-semibold text-gray-900">Escuela Segura</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-lg font-semibold text-gray-900">Menú</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentCompany?.name}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {mainNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive(item.path) ? 'text-gray-700' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Services Section */}
            {serviceNavItems.length > 0 && (
              <div className="mt-6 px-3">
                <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Archivos
                </p>
                <div className="space-y-1">
                  {serviceNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive(item.path) ? 'text-gray-700' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 p-4 space-y-2">
            <button
              onClick={() => handleNavigate(ROUTE_PATHS.SETTINGS)}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
              Configuración
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

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

export default MobileNav;
