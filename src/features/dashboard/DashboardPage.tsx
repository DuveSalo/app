
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FilterSort } from '../../components/common/FilterSort';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CalendarIcon, TrendingUpIcon, AlertCircleIcon, CheckCircleIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';
import { calculateExpirationStatus, calculateDaysUntilExpiration } from '../../lib/utils/dateUtils';
import { ExpirationStatus } from '../../types/expirable';
import { createLogger } from '../../lib/utils/logger';

const logger = createLogger('DashboardPage');

interface DashboardItem {
  id: string;
  name: string;
  type: string;
  expirationDate: string;
  status: ExpirationStatus;
  modulePath: string;
}

const DashboardPage: React.FC = () => {
    const [items, setItems] = useState<DashboardItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('expiration-asc');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const { currentCompany } = useAuth();
    const navigate = useNavigate();

    const calculateStatus = (expirationDate: string): { status: ExpirationStatus; daysUntil: number } => {
        return {
            status: calculateExpirationStatus(expirationDate),
            daysUntil: calculateDaysUntilExpiration(expirationDate)
        };
    };

    useEffect(() => {
        const fetchItems = async () => {
            if (!currentCompany) return;
            setIsLoading(true);

            try {
                const allItems: DashboardItem[] = [];

                // Fetch all data in parallel for better performance
                const [certsData, systemsData, qrDocs] = await Promise.all([
                    api.getCertificates(currentCompany.id),
                    api.getSelfProtectionSystems(currentCompany.id),
                    api.getAllQRDocuments(currentCompany.id)
                ]);

                const certs = certsData.map(c => ({
                    id: c.id,
                    name: `Cert. ${c.intervener}`,
                    type: 'Certificado de Conservación',
                    expirationDate: c.expirationDate,
                    modulePath: ROUTE_PATHS.CONSERVATION_CERTIFICATES,
                    status: calculateStatus(c.expirationDate).status
                }));
                allItems.push(...certs);

                const systems = systemsData.map(s => ({
                    id: s.id,
                    name: `SPA - ${s.registrationNumber || s.intervener || 'Sin matrícula'}`,
                    type: 'Sistema de Autoprotección',
                    expirationDate: s.expirationDate,
                    modulePath: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS,
                    status: calculateStatus(s.expirationDate).status
                }));
                allItems.push(...systems);

                const qrItems = qrDocs.map(doc => {
                    const expiry = new Date(doc.uploadDate);
                    expiry.setFullYear(expiry.getFullYear() + 1);
                    const expirationDate = expiry.toISOString().split('T')[0];
                    let linkPath = '';
                    switch (doc.type) {
                        case QRDocumentType.Elevators: linkPath = ROUTE_PATHS.QR_ELEVATORS; break;
                        case QRDocumentType.WaterHeaters: linkPath = ROUTE_PATHS.QR_WATER_HEATERS; break;
                        case QRDocumentType.FireSafetySystem: linkPath = ROUTE_PATHS.QR_FIRE_SAFETY; break;
                        case QRDocumentType.DetectionSystem: linkPath = ROUTE_PATHS.QR_DETECTION; break;
                        case QRDocumentType.ElectricalInstallations: linkPath = ROUTE_PATHS.ELECTRICAL_INSTALLATIONS; break;
                    }

                    return {
                        id: doc.id,
                        name: `Doc. ${doc.type}`,
                        type: doc.type,
                        expirationDate: expirationDate,
                        modulePath: linkPath,
                        status: calculateStatus(expirationDate).status
                    };
                });
                allItems.push(...qrItems);

                // Sort by expiration status: expired, then expiring, then valid
                const statusOrder = { expired: 1, expiring: 2, valid: 3 };
                setItems(allItems.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]));

            } catch (err: any) {
                logger.error("Error fetching dashboard data", err, { companyId: currentCompany?.id });
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [currentCompany]);

    // Filter and sort items
    const filteredAndSortedItems = useMemo(() => {
        let result = [...items];

        // Filter by search
        if (searchQuery) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by status
        if (filterStatus) {
            result = result.filter(item => item.status === filterStatus);
        }

        // Filter by type
        if (filterType) {
            result = result.filter(item => item.type === filterType);
        }

        // Sort
        const [sortField, sortOrder] = sortBy.split('-');
        result.sort((a, b) => {
            let aValue: any, bValue: any;

            if (sortField === 'name') {
                aValue = a.name;
                bValue = b.name;
            } else if (sortField === 'type') {
                aValue = a.type;
                bValue = b.type;
            } else if (sortField === 'expiration') {
                aValue = new Date(a.expirationDate).getTime();
                bValue = new Date(b.expirationDate).getTime();
            } else if (sortField === 'status') {
                const statusOrder = { expired: 1, expiring: 2, valid: 3 };
                aValue = statusOrder[a.status];
                bValue = statusOrder[b.status];
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return result;
    }, [items, searchQuery, sortBy, filterStatus, filterType]);

    const stats = {
        total: items.length,
        valid: items.filter(item => item.status === 'valid').length,
        expiring: items.filter(item => item.status === 'expiring').length,
        expired: items.filter(item => item.status === 'expired').length
    };

    const sortOptions = [
        { value: 'status-asc', label: 'Estado: Crítico primero' },
        { value: 'expiration-asc', label: 'Vencimiento: Más próximo' },
        { value: 'expiration-desc', label: 'Vencimiento: Más lejano' },
        { value: 'name-asc', label: 'Nombre: A-Z' },
        { value: 'name-desc', label: 'Nombre: Z-A' },
        { value: 'type-asc', label: 'Tipo: A-Z' },
        { value: 'type-desc', label: 'Tipo: Z-A' },
    ];

    const statusFilterOptions = [
        { value: 'valid', label: 'Vigente' },
        { value: 'expiring', label: 'Próximo a vencer' },
        { value: 'expired', label: 'Vencido' },
    ];

    // Get unique types for filter
    const typeFilterOptions = Array.from(new Set(items.map(item => item.type)))
        .sort()
        .map(type => ({ value: type, label: type }));

    const handleItemClick = (item: DashboardItem) => {
        navigate(item.modulePath);
    };

    if (isLoading) {
        return (
            <PageLayout title="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title={`Dashboard de ${currentCompany?.name}`}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card padding="md" variant="flat">
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <CalendarIcon className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</p>
                                <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
                            </div>
                        </div>
                    </Card>
                    <Card padding="md" variant="flat">
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vigentes</p>
                                <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.valid}</p>
                            </div>
                        </div>
                    </Card>
                    <Card padding="md" variant="flat">
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <TrendingUpIcon className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Por vencer</p>
                                <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.expiring}</p>
                            </div>
                        </div>
                    </Card>
                    <Card padding="md" variant="flat">
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <AlertCircleIcon className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vencidos</p>
                                <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.expired}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card padding="none">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-900">Control de Vencimientos</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Seguimiento de certificados y documentos</p>
                    </div>
                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon className="w-7 h-7 text-slate-400" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">Todo en orden</h3>
                            <p className="text-sm text-slate-500 mt-1">No hay elementos con vencimiento para mostrar.</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-4">
                                <FilterSort
                                    searchValue={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    sortValue={sortBy}
                                    onSortChange={setSortBy}
                                    sortOptions={sortOptions}
                                    filterValue={filterStatus}
                                    onFilterChange={setFilterStatus}
                                    filterOptions={statusFilterOptions}
                                    searchPlaceholder="Buscar por nombre o tipo..."
                                    additionalFilters={
                                        typeFilterOptions.length > 0 ? (
                                            <div className="relative w-full md:w-48">
                                                <select
                                                    value={filterType}
                                                    onChange={(e) => setFilterType(e.target.value)}
                                                    className="w-full appearance-none px-3.5 py-2.5 pr-9 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all duration-150 cursor-pointer"
                                                >
                                                    <option value="">Todos los tipos</option>
                                                    {typeFilterOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        ) : undefined
                                    }
                                />
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Fecha de vencimiento</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedItems.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>{new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={item.status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredAndSortedItems.length === 0 && items.length > 0 && (
                                <div className="text-center py-12">
                                    <p className="text-sm text-slate-500">No se encontraron elementos con los filtros aplicados.</p>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </PageLayout>
    );
};

export default DashboardPage;