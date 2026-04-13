import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Activity,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ROUTE_PATHS } from '@/constants/index';

const ADMIN_NAV_ITEMS = [
  { path: ROUTE_PATHS.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTE_PATHS.ADMIN_SCHOOLS, label: 'Escuelas', icon: Building2 },
  { path: ROUTE_PATHS.ADMIN_PAYMENTS, label: 'Pagos', icon: CreditCard },
  { path: ROUTE_PATHS.ADMIN_ACTIVITY, label: 'Actividad', icon: Activity },
  { path: ROUTE_PATHS.ADMIN_METRICS, label: 'Metricas', icon: BarChart3 },
  { path: ROUTE_PATHS.ADMIN_PLANS, label: 'Planes', icon: Settings },
];

const AdminSidebar = () => {
  const { currentUser, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'A';

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      <aside className="hidden md:flex flex-col justify-between flex-shrink-0 border-r border-sidebar-border bg-sidebar w-[256px]">
        <div className="flex items-center shrink-0 h-16 px-5">
          <div className="bg-primary rounded-lg flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">ES</span>
          </div>
          <div className="ml-3 flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">Escuela Segura</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto min-h-0 flex-1 custom-scrollbar px-3 py-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTE_PATHS.ADMIN_DASHBOARD}
                className={({ isActive }) =>
                  `w-full flex items-center rounded-lg transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 gap-2.5 h-11 px-3 text-sm ${
                    isActive
                      ? 'font-medium text-sidebar-accent-foreground bg-sidebar-accent'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center rounded-lg transition-colors duration-150 hover:bg-sidebar-accent outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 gap-2.5 h-11 px-3">
                <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-lg flex-shrink-0 w-7 h-7 text-[10px] font-medium">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="text-sm font-medium text-sidebar-foreground truncate">
                    {currentUser?.name}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {currentUser?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                <LogOut className="h-4 w-4 text-destructive" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        variant="destructive"
      />
    </>
  );
};

export default AdminSidebar;
