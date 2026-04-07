import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogOut, Building2, CreditCard, Users, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ROUTE_PATHS } from '@/constants/index';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useNavigationItems } from './useNavigationItems';

const Sidebar = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { userInitials, navItems } = useNavigationItems();

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
          <span className="ml-3 text-sm font-semibold text-foreground truncate">
            Escuela Segura
          </span>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto min-h-0 flex-1 custom-scrollbar px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTE_PATHS.DASHBOARD}
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

          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              <Link
                to={ROUTE_PATHS.ADMIN_DASHBOARD}
                className="w-full flex items-center rounded-lg transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 gap-2.5 h-11 px-3 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <ArrowRight className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                <span className="truncate">Ir al admin</span>
              </Link>
            </div>
          )}
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
              <DropdownMenuItem asChild>
                <Link to="/settings?tab=company">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings?tab=billing">
                  <CreditCard className="h-4 w-4" />
                  Facturacion
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings?tab=employees">
                  <Users className="h-4 w-4" />
                  Empleados
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings?tab=profile">
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                <LogOut className="h-4 w-4 text-destructive" />
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Deseas cerrar sesion?"
        message="Se cerrara tu sesion actual y tendras que volver a iniciar sesion para acceder."
        confirmText="Cerrar sesion"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
};

export default Sidebar;
