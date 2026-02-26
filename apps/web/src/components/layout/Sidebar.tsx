import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useNavigationItems } from './useNavigationItems';

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInitials, navItems } = useNavigationItems();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      <aside className="w-[260px] hidden md:flex flex-col justify-between flex-shrink-0 border-r border-neutral-200 bg-white p-5">
        {/* Top section: Logo + Nav */}
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="bg-brand-700 rounded-lg flex-shrink-0 w-8 h-8" />
            <span className="text-base font-bold text-neutral-900 font-[family-name:var(--font-heading)]">
              Escuela Segura
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center text-left transition-all duration-200 focus:outline-none gap-3 py-2.5 px-3 rounded-lg ${
                    active
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
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
          </nav>
        </div>

        {/* Bottom section: User */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center transition-all duration-200 focus:outline-none gap-3 px-2 py-2 rounded-lg hover:bg-neutral-50"
        >
          <div className="flex items-center justify-center bg-brand-700 text-white rounded-lg flex-shrink-0 w-9 h-9 text-xs font-semibold">
            {userInitials}
          </div>
          <span className="text-sm font-medium text-neutral-700">
            {currentUser?.name}
          </span>
        </button>
      </aside>

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
