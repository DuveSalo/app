import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileCheck,
  Shield,
  FireExtinguisher,
  Calendar,
  Zap,
  Building2,
  Droplets,
  Flame,
  ScanLine,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export function useNavigationItems() {
  const { currentUser } = useAuth();

  const userInitials = useMemo(() => {
    if (currentUser?.name) {
      return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  }, [currentUser]);

  const navItems: NavItem[] = [
    { path: ROUTE_PATHS.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
    { path: ROUTE_PATHS.CONSERVATION_CERTIFICATES, label: MODULE_TITLES.CONSERVATION_CERTIFICATES, icon: FileCheck },
    { path: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS, label: MODULE_TITLES.SELF_PROTECTION_SYSTEMS, icon: Shield },
    { path: ROUTE_PATHS.FIRE_EXTINGUISHERS, label: MODULE_TITLES.FIRE_EXTINGUISHERS, icon: FireExtinguisher },
    { path: ROUTE_PATHS.EVENT_INFORMATION, label: MODULE_TITLES.EVENT_INFORMATION, icon: Calendar },
    { path: ROUTE_PATHS.ELECTRICAL_INSTALLATIONS, label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS, icon: Zap },
    { path: ROUTE_PATHS.QR_ELEVATORS, label: MODULE_TITLES.QR_ELEVATORS, icon: Building2 },
    { path: ROUTE_PATHS.QR_WATER_HEATERS, label: MODULE_TITLES.QR_WATER_HEATERS, icon: Droplets },
    { path: ROUTE_PATHS.QR_FIRE_SAFETY, label: MODULE_TITLES.QR_FIRE_SAFETY, icon: Flame },
    { path: ROUTE_PATHS.QR_DETECTION, label: MODULE_TITLES.QR_DETECTION, icon: ScanLine },
    { path: ROUTE_PATHS.SETTINGS, label: MODULE_TITLES.SETTINGS, icon: Settings },
  ];

  return { userInitials, navItems };
}
