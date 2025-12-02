


import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { NavItem, QRDocumentType } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import {
    HomeIcon, DocumentTextIcon, ShieldCheckIcon, QrCodeIcon,
    ExclamationTriangleIcon, FireIcon, Cog6ToothIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon,
} from '../common/Icons';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { LogOut, Settings } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const MainNavLink: React.FC<{ item: NavItem; isCollapsed: boolean }> = ({ item, isCollapsed }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(item.path);
    return (
        <Link
            to={item.path}
            title={item.label}
            className={`flex items-center gap-3 rounded-lg transition-all duration-150 ease-out text-sm font-medium ${
                isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5'
            } ${
            isActive
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
        >
            {React.cloneElement(item.icon, { className: `w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}` })}
            <span className={isCollapsed ? 'hidden' : ''}>{item.label}</span>
        </Link>
    );
};

const ModuleLink: React.FC<{ item: NavItem; isCollapsed: boolean }> = ({ item, isCollapsed }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(item.path);
     return (
        <Link
            to={item.path}
            title={item.label}
            className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 ease-out ${
                isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2'
            } ${
            isActive
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
        >
            {React.cloneElement(item.icon, { className: `w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}` })}
            <span className={`${isCollapsed ? 'hidden' : ''} leading-tight`}>{item.label}</span>
        </Link>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const { currentUser, currentCompany, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userInitials = useMemo(() => {
        if (currentUser?.name) {
          return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return 'U';
    }, [currentUser]);

    const mainNavItems: NavItem[] = [
        { path: ROUTE_PATHS.DASHBOARD, label: 'Dashboard', icon: <HomeIcon /> },
        { path: ROUTE_PATHS.CONSERVATION_CERTIFICATES, label: MODULE_TITLES.CONSERVATION_CERTIFICATES, icon: <DocumentTextIcon /> },
        { path: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS, label: MODULE_TITLES.SELF_PROTECTION_SYSTEMS, icon: <ShieldCheckIcon /> },
        { path: ROUTE_PATHS.FIRE_EXTINGUISHERS, label: MODULE_TITLES.FIRE_EXTINGUISHERS, icon: <FireIcon /> },
        { path: ROUTE_PATHS.EVENT_INFORMATION, label: MODULE_TITLES.EVENT_INFORMATION, icon: <ExclamationTriangleIcon/> },
    ];
    
    const serviceNavItems: NavItem[] = [
        { path: ROUTE_PATHS.QR_ELEVATORS, label: MODULE_TITLES.QR_ELEVATORS, icon: <QrCodeIcon />, service: QRDocumentType.Elevators },
        { path: ROUTE_PATHS.QR_WATER_HEATERS, label: MODULE_TITLES.QR_WATER_HEATERS, icon: <QrCodeIcon />, service: QRDocumentType.WaterHeaters },
        { path: ROUTE_PATHS.QR_FIRE_SAFETY, label: MODULE_TITLES.QR_FIRE_SAFETY, icon: <QrCodeIcon />, service: QRDocumentType.FireSafetySystem },
        { path: ROUTE_PATHS.QR_DETECTION, label: MODULE_TITLES.QR_DETECTION, icon: <QrCodeIcon />, service: QRDocumentType.DetectionSystem },
        { path: ROUTE_PATHS.ELECTRICAL_INSTALLATIONS, label: MODULE_TITLES.ELECTRICAL_INSTALLATIONS, icon: <QrCodeIcon />, service: QRDocumentType.ElectricalInstallations },
    ];

    const enabledServiceItems = serviceNavItems.filter(item => item.service && currentCompany?.services?.[item.service]);

    return (
        <aside className={`bg-white border-r border-zinc-200/60 flex flex-col flex-shrink-0 transition-all duration-300 ease-out ${isCollapsed ? 'w-[72px]' : 'w-64'}`}>
            {/* Logo area */}
            <div className={`h-16 flex items-center border-b border-zinc-100 ${isCollapsed ? 'justify-center px-3' : 'px-5'}`}>
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-bold text-sm tracking-tight">ES</span>
                    </div>
                    <span className={`font-semibold text-zinc-900 tracking-tight ${isCollapsed ? 'hidden' : ''}`}>Escuela Segura</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col gap-y-6 overflow-hidden p-3">
                <nav className="flex flex-col gap-y-1">
                    {mainNavItems.map(item => <MainNavLink key={item.path} item={item} isCollapsed={isCollapsed} />)}
                </nav>

                {enabledServiceItems.length > 0 && (
                    <div className="space-y-2">
                        {!isCollapsed && (
                            <p className="px-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Servicios</p>
                        )}
                        <div className="space-y-0.5">
                            {enabledServiceItems.map(item => <ModuleLink key={item.path} item={item} isCollapsed={isCollapsed} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* User area */}
            <div className="mt-auto border-t border-zinc-100" ref={menuRef}>
                <div className="p-3">
                    <div className="relative">
                        <div
                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors duration-150 ${isCollapsed ? 'justify-center' : ''}`}
                            onClick={() => setIsUserMenuOpen(prev => !prev)}
                        >
                            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center ring-2 ring-white shadow-sm">
                                <span className="text-xs font-semibold text-white">{userInitials}</span>
                            </div>
                            <div className={`flex-1 min-w-0 ${isCollapsed ? 'hidden' : ''}`}>
                                <p className="text-sm font-semibold text-zinc-900 truncate">{currentUser?.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{currentCompany?.name}</p>
                            </div>
                            <Cog6ToothIcon className={`w-4.5 h-4.5 text-zinc-400 ${isCollapsed ? 'hidden' : ''}`}/>
                        </div>
                        {isUserMenuOpen && (
                            <div
                                className={`absolute bottom-full mb-2 w-52 bg-white rounded-xl shadow-dropdown border border-zinc-200/60 py-1.5 z-20 animate-fade-in-up ${
                                    isCollapsed ? 'left-0' : 'right-0'
                                }`}
                            >
                                <Link
                                    to={ROUTE_PATHS.SETTINGS}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    <Settings className="w-4 h-4 text-zinc-500" />
                                    Configuración
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        setIsLogoutDialogOpen(true);
                                    }}
                                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 text-zinc-500" />
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse toggle */}
                <div className="px-3 pb-3">
                    <button
                        onClick={onToggle}
                        className="w-full flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors duration-150"
                        title={isCollapsed ? 'Expandir menú' : 'Reducir menú'}
                    >
                        {isCollapsed ? <ChevronDoubleRightIcon className="h-4 w-4"/> : <ChevronDoubleLeftIcon className="h-4 w-4"/>}
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                onConfirm={() => {
                    setIsLogoutDialogOpen(false);
                    logout();
                }}
                title="¿Cerrar sesión?"
                message="Se cerrará tu sesión actual y tendrás que volver a iniciar sesión para acceder."
                confirmText="Cerrar sesión"
                cancelText="Cancelar"
                variant="danger"
            />
        </aside>
    );
};

export default Sidebar;