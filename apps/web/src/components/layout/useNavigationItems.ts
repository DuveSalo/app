import { useMemo } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';

export interface NavItem {
  path: string;
  label: string;
}

export function useNavigationItems() {
  const { currentUser } = useAuth();

  const userInitials = useMemo(() => {
    if (currentUser?.name) {
      return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  }, [currentUser]);

  // Single flat navigation list matching the .pen design exactly
  const navItems: NavItem[] = [
    { path: ROUTE_PATHS.DASHBOARD, label: 'Inicio' },
    { path: ROUTE_PATHS.CONSERVATION_CERTIFICATES, label: MODULE_TITLES.CONSERVATION_CERTIFICATES },
    { path: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS, label: MODULE_TITLES.SELF_PROTECTION_SYSTEMS },
    { path: ROUTE_PATHS.FIRE_EXTINGUISHERS, label: MODULE_TITLES.FIRE_EXTINGUISHERS },
    { path: ROUTE_PATHS.EVENT_INFORMATION, label: MODULE_TITLES.EVENT_INFORMATION },
    { path: ROUTE_PATHS.ELECTRICAL_INSTALLATIONS, label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS },
    { path: ROUTE_PATHS.QR_ELEVATORS, label: MODULE_TITLES.QR_ELEVATORS },
    { path: ROUTE_PATHS.QR_WATER_HEATERS, label: MODULE_TITLES.QR_WATER_HEATERS },
    { path: ROUTE_PATHS.QR_FIRE_SAFETY, label: MODULE_TITLES.QR_FIRE_SAFETY },
    { path: ROUTE_PATHS.QR_DETECTION, label: MODULE_TITLES.QR_DETECTION },
    { path: ROUTE_PATHS.SETTINGS, label: MODULE_TITLES.SETTINGS },
  ];

  return { userInitials, navItems };
}
