import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileCheck,
  ShieldCheck,
  FireExtinguisher,
  CalendarDays,
  Zap,
  ArrowUpDown,
  Thermometer,
  FlameKindling,
  ScanSearch,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import { QRDocumentType } from '../../types/qr';
import type { CompanyServices } from '../../types/company';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  serviceKey?: string;
}

export function useNavigationItems() {
  const { currentUser, currentCompany } = useAuth();

  const userInitials = useMemo(() => {
    if (currentUser?.name) {
      return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  }, [currentUser]);

  const navItems = useMemo(() => {
    const services = currentCompany?.services;

    const allItems: NavItem[] = [
      { path: ROUTE_PATHS.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
      { path: ROUTE_PATHS.CONSERVATION_CERTIFICATES, label: MODULE_TITLES.CONSERVATION_CERTIFICATES, icon: FileCheck },
      { path: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS, label: MODULE_TITLES.SELF_PROTECTION_SYSTEMS, icon: ShieldCheck },
      { path: ROUTE_PATHS.FIRE_EXTINGUISHERS, label: MODULE_TITLES.FIRE_EXTINGUISHERS, icon: FireExtinguisher },
      { path: ROUTE_PATHS.EVENT_INFORMATION, label: MODULE_TITLES.EVENT_INFORMATION, icon: CalendarDays },
      { path: ROUTE_PATHS.ELECTRICAL_INSTALLATIONS, label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS, icon: Zap, serviceKey: QRDocumentType.ElectricalInstallations },
      { path: ROUTE_PATHS.QR_ELEVATORS, label: MODULE_TITLES.QR_ELEVATORS, icon: ArrowUpDown, serviceKey: QRDocumentType.Elevators },
      { path: ROUTE_PATHS.QR_WATER_HEATERS, label: MODULE_TITLES.QR_WATER_HEATERS, icon: Thermometer, serviceKey: QRDocumentType.WaterHeaters },
      { path: ROUTE_PATHS.QR_FIRE_SAFETY, label: MODULE_TITLES.QR_FIRE_SAFETY, icon: FlameKindling, serviceKey: QRDocumentType.FireSafetySystem },
      { path: ROUTE_PATHS.QR_DETECTION, label: MODULE_TITLES.QR_DETECTION, icon: ScanSearch, serviceKey: QRDocumentType.DetectionSystem },
    ];

    // If no services configured, show all items
    if (!services) return allItems;

    return allItems.filter(item => {
      if (!item.serviceKey) return true;
      return services[item.serviceKey as keyof CompanyServices] === true;
    });
  }, [currentCompany?.services]);

  return { userInitials, navItems };
}
