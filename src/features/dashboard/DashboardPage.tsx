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
import { calculateExpirationStatus } from '../../lib/utils/dateUtils';
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
                    status: calculateExpirationStatus(c.expirationDate)
                }));
                allItems.push(...certs);

                const systems = systemsData.map(s => ({
                    id: s.id,
                    name: `SPA - ${s.registrationNumber || s.intervener || 'Sin matrícula'}`,
                    type: 'Sistema de Autoprotección',
                    expirationDate: s.expirationDate,
                    modulePath: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS,
                    status: calculateExpirationStatus(s.expirationDate)
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
                        status: calculateExpirationStatus(expirationDate)
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
                {/* Metric Cards - Unified Design System */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Card */}
                    <div className="group bg-zinc-100 hover:bg-zinc-200/80 rounded-xl p-5 border border-zinc-200/60 shadow-card hover:shadow-card-hover transition-all duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Total</p>
                                <p className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">{stats.total}</p>
                            </div>
                            <div className="h-11 w-11 rounded-lg bg-zinc-200/80 flex items-center justify-center group-hover:bg-zinc-300 transition-colors">
                                <CalendarIcon className="w-5 h-5 text-zinc-700" />
                            </div>
                        </div>
                    </div>

                    {/* Vigentes Card */}
                    <div className="group bg-emerald-50 hover:bg-emerald-100 rounded-xl p-5 border border-emerald-200/60 shadow-card hover:shadow-card-hover transition-all duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Vigentes</p>
                                <p className="text-3xl font-bold text-emerald-700 mt-2 tracking-tight">{stats.valid}</p>
                            </div>
                            <div className="h-11 w-11 rounded-lg bg-emerald-200/80 flex items-center justify-center group-hover:bg-emerald-300 transition-colors">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-700" />
                            </div>
                        </div>
                    </div>

                    {/* Por vencer Card */}
                    <div className="group bg-amber-50 hover:bg-amber-100 rounded-xl p-5 border border-amber-200/60 shadow-card hover:shadow-card-hover transition-all duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Por vencer</p>
                                <p className="text-3xl font-bold text-amber-700 mt-2 tracking-tight">{stats.expiring}</p>
                            </div>
                            <div className="h-11 w-11 rounded-lg bg-amber-200/80 flex items-center justify-center group-hover:bg-amber-300 transition-colors">
                                <TrendingUpIcon className="w-5 h-5 text-amber-700" />
                            </div>
                        </div>
                    </div>

                    {/* Vencidos Card */}
                    <div className="group bg-rose-50 hover:bg-rose-100 rounded-xl p-5 border border-rose-200/60 shadow-card hover:shadow-card-hover transition-all duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-rose-700 uppercase tracking-wider">Vencidos</p>
                                <p className="text-3xl font-bold text-rose-700 mt-2 tracking-tight">{stats.expired}</p>
                            </div>
                            <div className="h-11 w-11 rounded-lg bg-rose-200/80 flex items-center justify-center group-hover:bg-rose-300 transition-colors">
                                <AlertCircleIcon className="w-5 h-5 text-rose-700" />
                            </div>
                        </div>
                    </div>
                </div>

                <Card padding="none">
                    <div className="px-6 py-4 border-b border-zinc-100">
                        <h2 className="text-base font-semibold text-zinc-900 tracking-tight">Control de Vencimientos</h2>
                        <p className="text-sm text-zinc-500 mt-0.5">Seguimiento de certificados y documentos</p>
                    </div>
                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="h-14 w-14 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon className="w-7 h-7 text-zinc-400" />
                            </div>
                            <h3 className="text-base font-semibold text-zinc-900">Todo en orden</h3>
                            <p className="text-sm text-zinc-500 mt-1">No hay elementos con vencimiento para mostrar.</p>
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
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
                                                    className="w-full appearance-none px-3.5 py-2.5 pr-9 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all duration-150 cursor-pointer"
                                                >
                                                    <option value="">Todos los tipos</option>
                                                    {typeFilterOptions.map((option: { value: string; label: string }) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    {filteredAndSortedItems.map((item: DashboardItem) => (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer hover:bg-zinc-50 transition-colors"
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <TableCell className="font-medium text-zinc-900">{item.name}</TableCell>
                                            <TableCell className="text-zinc-600">{item.type}</TableCell>
                                            <TableCell className="text-zinc-600">{new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={item.status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredAndSortedItems.length === 0 && items.length > 0 && (
                                <div className="text-center py-12">
                                    <p className="text-sm text-zinc-500">No se encontraron elementos con los filtros aplicados.</p>
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