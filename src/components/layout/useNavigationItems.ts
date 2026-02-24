import React, { useMemo } from 'react';
import {
  Home,
  FileText,
  ShieldCheck,
  Flame,
  AlertTriangle,
  FolderOpen,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export function useNavigationItems() {
  const { currentUser, currentCompany } = useAuth();

  const userInitials = useMemo(() => {
    if (currentUser?.name) {
      return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  }, [currentUser]);

  const mainNavItems: NavItem[] = [
    { path: ROUTE_PATHS.DASHBOARD, label: 'Dashboard', icon: React.createElement(Home, { className: 'w-5 h-5' }) },
    { path: ROUTE_PATHS.CONSERVATION_CERTIFICATES, label: MODULE_TITLES.CONSERVATION_CERTIFICATES, icon: React.createElement(FileText, { className: 'w-5 h-5' }) },
    { path: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS, label: MODULE_TITLES.SELF_PROTECTION_SYSTEMS, icon: React.createElement(ShieldCheck, { className: 'w-5 h-5' }) },
    { path: ROUTE_PATHS.FIRE_EXTINGUISHERS, label: MODULE_TITLES.FIRE_EXTINGUISHERS, icon: React.createElement(Flame, { className: 'w-5 h-5' }) },
    { path: ROUTE_PATHS.EVENT_INFORMATION, label: MODULE_TITLES.EVENT_INFORMATION, icon: React.createElement(AlertTriangle, { className: 'w-5 h-5' }) },
    { path: ROUTE_PATHS.ELECTRICAL_INSTALLATIONS, label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS, icon: React.createElement(Zap, { className: 'w-5 h-5' }) },
  ];

  const serviceNavItems: NavItem[] = useMemo(() => {
    const services = [
      { path: ROUTE_PATHS.QR_ELEVATORS, label: MODULE_TITLES.QR_ELEVATORS, service: QRDocumentType.Elevators },
      { path: ROUTE_PATHS.QR_WATER_HEATERS, label: MODULE_TITLES.QR_WATER_HEATERS, service: QRDocumentType.WaterHeaters },
      { path: ROUTE_PATHS.QR_FIRE_SAFETY, label: MODULE_TITLES.QR_FIRE_SAFETY, service: QRDocumentType.FireSafetySystem },
      { path: ROUTE_PATHS.QR_DETECTION, label: MODULE_TITLES.QR_DETECTION, service: QRDocumentType.DetectionSystem },
    ];

    return services
      .filter(item => currentCompany?.services?.[item.service])
      .map(item => ({
        path: item.path,
        label: item.label,
        icon: React.createElement(FolderOpen, { className: 'w-5 h-5' }),
      }));
  }, [currentCompany?.services]);

  return { userInitials, mainNavItems, serviceNavItems };
}
