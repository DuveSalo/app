import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import NotificationBell from './NotificationBell';
import { useNavigationItems } from './useNavigationItems';

const MobileNav = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInitials, navItems } = useNavigationItems();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

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
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="bg-brand-700 rounded-lg flex-shrink-0 w-8 h-8" />
          <span className="text-base font-bold text-neutral-900 font-[family-name:var(--font-heading)]">Escuela Segura</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-neutral-50 transition-colors focus:outline-none rounded-md"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 text-neutral-900" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-out md:hidden flex flex-col shadow-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200">
            <span className="text-base font-medium text-neutral-900">Menú</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-neutral-50 transition-colors focus:outline-none rounded-md"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-5 py-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="bg-brand-700 text-white flex items-center justify-center rounded-lg flex-shrink-0 w-9 h-9 text-xs font-semibold">
                {userInitials}
              </div>
              <span className="text-sm font-medium text-neutral-900">
                {currentUser?.name}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="flex flex-col">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center text-left transition-all duration-200 focus:outline-none gap-3 py-2.5 px-3 rounded-lg ${
                      active
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${active ? 'bg-brand-700' : 'bg-transparent'}`}
                    />
                    <span
                      className={`text-sm ${active ? 'font-medium' : 'font-normal'}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer: Logout */}
          <div className="border-t border-neutral-200 p-4">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center gap-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors focus:outline-none"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

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
