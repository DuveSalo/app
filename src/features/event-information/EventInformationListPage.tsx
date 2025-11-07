
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventInformation } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { Button } from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { EditIcon, TrashIcon, PlusIcon, ExclamationTriangleIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';

const EventInformationListPage: React.FC = () => {
  const [events, setEvents] = useState<EventInformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); 
  const navigate = useNavigate();
  
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError((err as Error).message || "Error al cargar información de eventos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este evento?")) {
      setError('');
      try {
        await api.deleteEvent(id);
        setEvents(prev => prev.filter(event => event.id !== id));
      } catch (err: any) {
        setError((err as Error).message || "Error al eliminar el evento.");
      }
    }
  };

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_EVENT_INFORMATION)}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Nuevo evento
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.EVENT_INFORMATION} headerActions={headerActions}>
      {error && <p className="text-red-500 text-center py-2">{error}</p>}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center h-full">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay eventos registrados</h3>
          <p className="text-gray-500 mb-4">Comience registrando su primer evento o incidente.</p>
          <Button 
            onClick={() => navigate(ROUTE_PATHS.NEW_EVENT_INFORMATION)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Registrar primer evento
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Fecha</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map(event => (
                <TableRow key={event.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{event.description}</TableCell>
                  <TableCell className="text-center">{new Date(event.date).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Registrado
                      </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex space-x-1 justify-center">
                      <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.EDIT_EVENT_INFORMATION.replace(':id', event.id))} title="Editar">
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)} className="text-red-600 hover:bg-red-50" title="Eliminar">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  );
};

export default EventInformationListPage;