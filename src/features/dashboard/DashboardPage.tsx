
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/common/Card';
import { SkeletonDashboard } from '../../components/common/SkeletonLoader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CalendarIcon, TrendingUpIcon, AlertCircleIcon, CheckCircleIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';

interface DashboardItem {
  id: string;
  name: string;
  type: string;
  expirationDate: string;
  status: 'valid' | 'expiring' | 'expired';
  modulePath: string;
}

const DashboardPage: React.FC = () => {
    const [items, setItems] = useState<DashboardItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentCompany } = useAuth();
    const navigate = useNavigate();

    const calculateStatus = (expirationDate: string): { status: DashboardItem['status']; daysUntil: number } => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expirationDate);
        
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return { status: 'expired', daysUntil: diffDays };
        if (diffDays <= 30) return { status: 'expiring', daysUntil: diffDays };
        return { status: 'valid', daysUntil: diffDays };
    };

    useEffect(() => {
        const fetchItems = async () => {
            if (!currentCompany) return;
            setIsLoading(true);

            try {
                const allItems: DashboardItem[] = [];

                const certsData = await api.getCertificates();
                const certs = certsData.map(c => ({
                    id: c.id,
                    name: `Cert. ${c.intervener}`,
                    type: 'Certificado de Conservación',
                    expirationDate: c.expirationDate,
                    modulePath: ROUTE_PATHS.CONSERVATION_CERTIFICATES,
                    status: calculateStatus(c.expirationDate).status
                }));
                allItems.push(...certs);

                const systemsData = await api.getSelfProtectionSystems();
                const systems = systemsData.map(s => ({
                    id: s.id,
                    name: s.systemName,
                    type: 'Sistema de Autoprotección',
                    expirationDate: s.nextInspectionDate,
                    modulePath: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS,
                    status: calculateStatus(s.nextInspectionDate).status
                }));
                allItems.push(...systems);

                const qrDocs = await api.getAllQRDocuments();
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

    const stats = {
        total: items.length,
        valid: items.filter(item => item.status === 'valid').length,
        expiring: items.filter(item => item.status === 'expiring').length,
        expired: items.filter(item => item.status === 'expired').length
    };

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
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total de elementos</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <CalendarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Vigentes</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.valid}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Próximos a vencer</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.expiring}</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <TrendingUpIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Vencidos</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.expired}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <AlertCircleIcon className="w-6 h-6 text-red-600" />
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
                                {items.map((item) => (
                                    <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleItemClick(item)}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.type}</TableCell>
                                        <TableCell>{new Date(item.expirationDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={item.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>
        </PageLayout>
    );
};

export default DashboardPage;