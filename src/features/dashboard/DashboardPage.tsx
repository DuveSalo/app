
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/common/Card';
import { SkeletonDashboard } from '../../components/common/SkeletonLoader';
import { FilterSort } from '../../components/common/FilterSort';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CalendarIcon, TrendingUpIcon, AlertCircleIcon, CheckCircleIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';
import { calculateExpirationStatus, calculateDaysUntilExpiration } from '../../lib/utils/dateUtils';
import { ExpirationStatus } from '../../types/expirable';

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
                console.error("Error fetching dashboard data:", err);
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
                <SkeletonDashboard />
            </PageLayout>
        );
    }

    return (
        <PageLayout title={`Dashboard de ${currentCompany?.name}`}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-600">Total de elementos</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                <CalendarIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-600">Vigentes</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.valid}</p>
                            </div>
                            <div className="bg-green-100 rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-yellow-600">Próximos a vencer</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expiring}</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-red-600">Vencidos</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expired}</p>
                            </div>
                            <div className="bg-red-100 rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                <AlertCircleIcon className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                <Card padding="none">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Control de Vencimientos</h2>
                    </div>
                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">¡Todo en orden!</h3>
                            <p className="text-gray-500">No hay elementos con vencimiento para mostrar.</p>
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
                                            <select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">Todos los tipos</option>
                                                {typeFilterOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
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
                                    {filteredAndSortedItems.map((item, index) => (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors animate-fade-in"
                                            onClick={() => handleItemClick(item)}
                                            style={{ animationDelay: `${index * 50}ms` }}
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
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No se encontraron elementos con los filtros aplicados.</p>
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