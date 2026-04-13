import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Building2, CreditCard, Users, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ROUTE_PATHS } from '@/constants/index';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TrialMobileIndicator } from '../common/TrialBanner';
import NotificationBell from './NotificationBell';
import { useNavigationItems } from './useNavigationItems';

const MobileNav = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const { userInitials, navItems } = useNavigationItems();

  const closeDrawer = () => setIsOpen(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    setIsOpen(false);
    logout();
  };

  const settingsItems = [
    { path: '/settings?tab=company', label: 'Empresa', icon: Building2 },
    { path: '/settings?tab=billing', label: 'Facturacion', icon: CreditCard },
    { path: '/settings?tab=employees', label: 'Empleados', icon: Users },
    { path: '/settings?tab=profile', label: 'Mi Perfil', icon: User },
  ];

  const currentPath = `${location.pathname}${location.search}`;

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 h-[52px] bg-background border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary rounded-lg flex-shrink-0 w-7 h-7 flex items-center justify-center">
            <span className="text-primary-foreground text-[9px] font-bold">ES</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Escuela Segura</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-foreground/30 backdrop-blur-[2px] z-40 md:hidden"
          onClick={closeDrawer}
          aria-label="Cerrar menú"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-background z-50 transform transition-transform duration-300 ease-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 h-[52px] border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground flex items-center justify-center rounded-lg flex-shrink-0 w-7 h-7 text-[10px] font-medium">
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
              onClick={closeDrawer}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === ROUTE_PATHS.DASHBOARD}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      `w-full flex items-center rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none gap-2.5 py-2 px-3 ${
                        isActive
                          ? 'text-foreground bg-muted font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                        <span className="text-sm truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground px-3 py-1.5">Configuración</p>
              <div className="flex flex-col gap-0.5">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentPath === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeDrawer}
                      className={`w-full flex items-center rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none gap-2.5 py-2 px-3 ${
                        active
                          ? 'text-foreground bg-muted font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.75} />
                      <span className="text-sm truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {isAdmin && (
              <div className="mt-2 pt-2 border-t border-border">
                <Link
                  to={ROUTE_PATHS.ADMIN_DASHBOARD}
                  onClick={closeDrawer}
                  className="w-full flex items-center rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none gap-2.5 py-2 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ArrowRight className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-sm truncate">Ir al admin</span>
                </Link>
              </div>
            )}
          </nav>

          <TrialMobileIndicator onNavigate={closeDrawer} />

          <div className="border-t border-border p-2">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
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
        variant="destructive"
      />
    </>
  );
};

export default MobileNav;
