
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelfProtectionSystem } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { Button } from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EditIcon, TrashIcon, PlusIcon, ShieldCheckIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';

const SelfProtectionSystemListPage: React.FC = () => {
  const [systems, setSystems] = useState<SelfProtectionSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const loadSystems = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getSelfProtectionSystems();
      setSystems(data);
    } catch (err: any) {
      setError((err as Error).message || "Error al cargar sistemas de autoprotección");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este sistema?")) {
      setError('');
      try {
        await api.deleteSelfProtectionSystem(id);
        setSystems(prev => prev.filter(sys => sys.id !== id));
      } catch (err: any) {
        setError((err as Error).message || "Error al eliminar el sistema");
      }
    }
  };
  
  const getStatus = (expirationDate: string): 'valid' | 'expiring' | 'expired' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'expired';
    if (diffDays <= 30) return 'expiring';
    return 'valid';
  };

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM)}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Nuevo sistema
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.SELF_PROTECTION_SYSTEMS} headerActions={headerActions}>
      {error && <p className="text-red-500 text-center py-2">{error}</p>}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
        </div>
      ) : systems.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center h-full">
          <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay sistemas registrados</h3>
          <p className="text-gray-500 mb-4">Comience registrando su primer sistema de autoprotección.</p>
          <Button 
            onClick={() => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Crear primer sistema
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Interviniente</TableHead>
              <TableHead>Disp. Aprobatoria</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {systems.map(sys => (
              <TableRow key={sys.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{sys.intervener}</TableCell>
                <TableCell>{sys.probatoryDispositionDate ? new Date(sys.probatoryDispositionDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{new Date(sys.expirationDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <StatusBadge status={getStatus(sys.expirationDate)} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.replace(':id', sys.id))}><EditIcon/></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(sys.id)} className="text-red-600 hover:bg-red-100"><TrashIcon/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageLayout>
  );
};

export default SelfProtectionSystemListPage;