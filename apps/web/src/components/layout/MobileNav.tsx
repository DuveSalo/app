import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Building2, CreditCard, Users, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ROUTE_PATHS } from '@/constants/index';
import { ConfirmDialog } from '../common/ConfirmDialog';
import NotificationBell from './NotificationBell';
import { useNavigationItems } from './useNavigationItems';

const MobileNav = () => {
  const { currentUser, isAdmin, logout } = useAuth();
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

  const settingsItems = [
    { path: '/settings?tab=company', label: 'Empresa', icon: Building2 },
    { path: '/settings?tab=billing', label: 'Facturación', icon: CreditCard },
    { path: '/settings?tab=employees', label: 'Empleados', icon: Users },
    { path: '/settings?tab=profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-13 bg-background border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary rounded-md flex-shrink-0 w-7 h-7 flex items-center justify-center">
            <span className="text-primary-foreground text-[9px] font-bold">ES</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Escuela Segura</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-md hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 backdrop-blur-[2px] z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-background z-50 transform transition-transform duration-250 ease-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 h-13 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground flex items-center justify-center rounded-md flex-shrink-0 w-7 h-7 text-[10px] font-medium">
                {userInitials}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-medium text-foreground truncate block">
                  {currentUser?.name}
                </span>
                <span className="text-xs text-muted-foreground truncate block">
                  {currentUser?.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center text-left rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none gap-2.5 py-2 px-3 ${
                      active
                        ? 'text-foreground bg-muted font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.75} />
                    <span className="text-sm truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Settings section */}
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground px-3 py-1.5">Configuración</p>
              <div className="flex flex-col gap-0.5">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center text-left rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none gap-2.5 py-2 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                      <span className="text-sm truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isAdmin && (
              <div className="mt-2 pt-2 border-t border-border">
                <button
                  onClick={() => handleNavigate(ROUTE_PATHS.ADMIN_DASHBOARD)}
                  className="w-full flex items-center text-left rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none gap-2.5 py-2 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ArrowRight className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-sm truncate">Ir al admin</span>
                </button>
              </div>
            )}
          </nav>

          {/* Footer: Logout */}
          <div className="border-t border-border p-2">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center gap-2.5 py-2 px-3 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
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
