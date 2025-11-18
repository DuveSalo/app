


import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { NavItem, QRDocumentType } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import {
    HomeIcon, DocumentTextIcon, ShieldCheckIcon, QrCodeIcon,
    ExclamationTriangleIcon, FireIcon, Cog6ToothIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon,
} from '../common/Icons';

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
            className={`flex items-center gap-3 rounded-md transition-colors duration-200 text-sm font-medium ${
                isCollapsed ? 'p-2 justify-center' : 'px-3 py-2'
            } ${
            isActive 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            {React.cloneElement(item.icon, { className: "w-5 h-5 flex-shrink-0" })}
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
            className={`flex items-center gap-3 rounded-md text-sm truncate transition-colors duration-200 ${
                isCollapsed ? 'p-2 justify-center' : 'px-3 py-1.5'
            } ${
            isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
            {React.cloneElement(item.icon, { className: "w-5 h-5 flex-shrink-0" })}
            <span className={isCollapsed ? 'hidden' : ''}>{item.label}</span>
        </Link>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const { currentUser, currentCompany, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
        <aside className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 p-4 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex-1 flex flex-col gap-y-7 overflow-y-auto overflow-x-hidden">
                <nav className="flex flex-col gap-y-1">
                    {mainNavItems.map(item => <MainNavLink key={item.path} item={item} isCollapsed={isCollapsed} />)}
                </nav>

                {enabledServiceItems.length > 0 && (
                    <div className="space-y-3">
                        <div className="border-t border-gray-200" />
                        <div className="space-y-1">
                            {enabledServiceItems.map(item => <ModuleLink key={item.path} item={item} isCollapsed={isCollapsed} />)}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto">
                 <div className="border-t border-gray-200" ref={menuRef}>
                    <div className="relative mt-4">
                        <div 
                            className={`flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                            onClick={() => setIsUserMenuOpen(prev => !prev)}
                        >
                            <div className="flex items-center gap-x-3 group flex-1 min-w-0">
                                <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">{userInitials}</span>
                                </div>
                                <div className={`min-w-0 ${isCollapsed ? 'hidden' : ''}`}>
                                    <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{currentCompany?.name}</p>
                                </div>
                            </div>
                            <Cog6ToothIcon className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 ${isCollapsed ? 'hidden' : ''}`}/>
                        </div>
                        {isUserMenuOpen && (
                             <div
                                className={`absolute bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20 ${
                                    isCollapsed ? 'left-0' : 'right-0'
                                }`}
                            >
                                <Link
                                    to={ROUTE_PATHS.SETTINGS}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    Configuración
                                </Link>
                                <button
                                    onClick={logout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Cerrar Sesión
                                </button>
                             </div>
                        )}
                    </div>
                </div>
                 <div className="border-t border-gray-200 mt-2">
                    <button 
                        onClick={onToggle}
                        className="w-full flex items-center justify-center p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        title={isCollapsed ? 'Expandir menú' : 'Reducir menú'}
                    >
                         {isCollapsed ? <ChevronDoubleRightIcon className="h-5 w-5"/> : <ChevronDoubleLeftIcon className="h-5 w-5"/>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;