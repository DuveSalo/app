/**
 * Routes Configuration
 * Centralized configuration for application routes with lazy-loaded components
 */
import React from 'react';
import { QRDocumentType } from '../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../constants/index';

// Lazy-loaded page components
export const LazyPages = {
    // Auth pages
    AuthPage: React.lazy(() => import('../features/auth/AuthPage')),
    AuthCallbackPage: React.lazy(() => import('../features/auth/AuthCallbackPage')),
    CreateCompanyPage: React.lazy(() => import('../features/auth/CreateCompanyPage')),
    SubscriptionPage: React.lazy(() => import('../features/auth/SubscriptionPage')),
    SubscriptionCheckoutPage: React.lazy(() => import('../features/auth/SubscriptionCheckoutPage')),
    PaymentCallbackPage: React.lazy(() => import('../features/auth/PaymentCallbackPage')),

    // Main pages
    DashboardPage: React.lazy(() => import('../features/dashboard/DashboardPage')),
    SettingsPage: React.lazy(() => import('../features/settings/SettingsPage')),
    NotificationsPage: React.lazy(() => import('../features/notifications/NotificationsPage')),

    // Conservation Certificates
    ConservationCertificateListPage: React.lazy(() => import('../features/conservation-certificates/ConservationCertificateListPage')),
    CreateEditConservationCertificatePage: React.lazy(() => import('../features/conservation-certificates/CreateEditConservationCertificatePage')),

    // Self Protection Systems
    SelfProtectionSystemListPage: React.lazy(() => import('../features/self-protection-systems/SelfProtectionSystemListPage')),
    CreateEditSelfProtectionSystemPage: React.lazy(() => import('../features/self-protection-systems/CreateEditSelfProtectionSystemPage')),

    // QR Documents
    QRModuleListPage: React.lazy(() => import('../features/qr/QRModuleListPage')),
    UploadQRDocumentPage: React.lazy(() => import('../features/qr/UploadQRDocumentPage')),
    EditQRDocumentPage: React.lazy(() => import('../features/qr/EditQRDocumentPage')),

    // Event Information
    EventInformationListPage: React.lazy(() => import('../features/event-information/EventInformationListPage')),
    CreateEditEventInformationPage: React.lazy(() => import('../features/event-information/CreateEditEventInformationPage')),

    // Fire Extinguishers
    FireExtinguisherListPage: React.lazy(() => import('../features/fire-extinguishers/FireExtinguisherListPage')),
    CreateEditFireExtinguisherPage: React.lazy(() => import('../features/fire-extinguishers/CreateEditFireExtinguisherPage')),

    // Placeholders
    PlaceholderPage: React.lazy(() => import('../features/placeholders/PlaceholderPage')),
};

// QR Module route configuration
export interface QRModuleRouteConfig {
    type: QRDocumentType;
    title: string;
    listPath: string;
    uploadPath: string;
    editPath: string;
}

export const QR_MODULE_ROUTES: QRModuleRouteConfig[] = [
    {
        type: QRDocumentType.Elevators,
        title: MODULE_TITLES.QR_ELEVATORS,
        listPath: ROUTE_PATHS.QR_ELEVATORS,
        uploadPath: ROUTE_PATHS.UPLOAD_QR_ELEVATORS,
        editPath: ROUTE_PATHS.EDIT_QR_ELEVATORS,
    },
    {
        type: QRDocumentType.WaterHeaters,
        title: MODULE_TITLES.QR_WATER_HEATERS,
        listPath: ROUTE_PATHS.QR_WATER_HEATERS,
        uploadPath: ROUTE_PATHS.UPLOAD_QR_WATER_HEATERS,
        editPath: ROUTE_PATHS.EDIT_QR_WATER_HEATERS,
    },
    {
        type: QRDocumentType.FireSafetySystem,
        title: MODULE_TITLES.QR_FIRE_SAFETY,
        listPath: ROUTE_PATHS.QR_FIRE_SAFETY,
        uploadPath: ROUTE_PATHS.UPLOAD_QR_FIRE_SAFETY,
        editPath: ROUTE_PATHS.EDIT_QR_FIRE_SAFETY,
    },
    {
        type: QRDocumentType.DetectionSystem,
        title: MODULE_TITLES.QR_DETECTION,
        listPath: ROUTE_PATHS.QR_DETECTION,
        uploadPath: ROUTE_PATHS.UPLOAD_QR_DETECTION,
        editPath: ROUTE_PATHS.EDIT_QR_DETECTION,
    },
    {
        type: QRDocumentType.ElectricalInstallations,
        title: MODULE_TITLES.ELECTRICAL_INSTALLATIONS,
        listPath: ROUTE_PATHS.ELECTRICAL_INSTALLATIONS,
        uploadPath: ROUTE_PATHS.UPLOAD_ELECTRICAL_INSTALLATIONS,
        editPath: ROUTE_PATHS.EDIT_ELECTRICAL_INSTALLATIONS,
    },
];

// Placeholder module configuration
export interface PlaceholderRouteConfig {
    path: string;
    title: string;
}

export const PLACEHOLDER_ROUTES: PlaceholderRouteConfig[] = [
    { path: ROUTE_PATHS.WATER_TANKS, title: MODULE_TITLES.WATER_TANKS },
    { path: ROUTE_PATHS.PLANT_SPECIES, title: MODULE_TITLES.PLANT_SPECIES },
    { path: ROUTE_PATHS.SANITIZATION, title: MODULE_TITLES.SANITIZATION },
];
