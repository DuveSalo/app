import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
      <aside className="hidden md:flex flex-col justify-between flex-shrink-0 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)] w-[256px]">
        {/* Logo */}
        <div className="flex items-center shrink-0 h-14 border-b border-neutral-200 px-4">
          <div className="bg-neutral-900 rounded-md flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <span className="text-white text-xs font-bold">ES</span>
          </div>
          <span className="ml-3 text-sm font-semibold text-neutral-900 truncate">
            Escuela Segura
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 mt-2 overflow-y-auto min-h-0 flex-1 custom-scrollbar px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center text-left rounded-md transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 gap-2.5 py-1.5 px-2.5 text-sm ${
                  active
                    ? 'font-medium text-white bg-neutral-900'
                    : 'text-neutral-500 hover:bg-[var(--sidebar-accent)] hover:text-neutral-900'
                }`}
              >
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-neutral-200 p-2">
          {/* User */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center rounded-md transition-colors duration-150 hover:bg-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 mt-0.5 gap-2.5 py-1.5 px-2.5"
          >
            <div className="flex items-center justify-center bg-neutral-900 text-white rounded-md flex-shrink-0 w-7 h-7 text-[10px] font-medium">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900 truncate">
                {currentUser?.name}
              </span>
              <LogOut className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.75} />
            </div>
          </button>
        </div>
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

