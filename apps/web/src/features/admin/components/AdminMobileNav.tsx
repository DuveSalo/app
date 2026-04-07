import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Building2,
  CreditCard,
  Activity,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ROUTE_PATHS } from '@/constants/index';

const ADMIN_NAV_ITEMS = [
  { path: ROUTE_PATHS.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTE_PATHS.ADMIN_SCHOOLS, label: 'Escuelas', icon: Building2 },
  { path: ROUTE_PATHS.ADMIN_PAYMENTS, label: 'Pagos', icon: CreditCard },
  { path: ROUTE_PATHS.ADMIN_ACTIVITY, label: 'Actividad', icon: Activity },
  { path: ROUTE_PATHS.ADMIN_METRICS, label: 'Métricas', icon: BarChart3 },
  { path: ROUTE_PATHS.ADMIN_PLANS, label: 'Planes', icon: Settings },
];

const AdminMobileNav = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'A';

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
      <div className="md:hidden flex items-center justify-between px-4 h-13 bg-background border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary rounded-lg flex-shrink-0 w-7 h-7 flex items-center justify-center">
            <span className="text-primary-foreground text-[9px] font-bold">ES</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Escuela Segura</span>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider leading-none">
              Admin
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
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
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div className="flex flex-col gap-0.5">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center text-left rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none gap-2.5 py-2 px-3 ${
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
          </nav>

          {/* Footer: Logout */}
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

export default AdminMobileNav;
