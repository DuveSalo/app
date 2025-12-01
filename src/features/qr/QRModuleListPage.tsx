
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDocument, QRDocumentType } from '../../types/index';
import * as api from '../../lib/api/supabaseApi';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrashIcon, PlusIcon, QrCodeIcon, EyeIcon, EditIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';

interface QRModulePageProps {
  qrType: QRDocumentType;
  title: string;
  uploadPath: string;
  editPath: string;
}

const QRModuleListPage: React.FC<QRModulePageProps> = ({ qrType, title, uploadPath, editPath }) => {
  const [documents, setDocuments] = useState<QRDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentCompany } = useAuth();

  const loadDocuments = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getQRDocuments(qrType, currentCompany.id);
      setDocuments(data);
    } catch (err: any) {
      setError((err as Error).message || `Error al cargar documentos QR de ${title}`);
    } finally {
      setIsLoading(false);
    }
  }, [qrType, title, currentCompany]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este documento?")) {
      setError('');
      try {
        await api.deleteQRDocument(id);
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      } catch (err: any) {
        setError((err as Error).message || "Error al eliminar el documento.");
      }
    }
  };

  const calculateExpiration = (extractedDate: string) => {
      const expiry = new Date(extractedDate);
      expiry.setFullYear(expiry.getFullYear() + 1);
      return expiry;
  };

  const getStatus = (expirationDate: Date): 'valid' | 'expiring' | 'expired' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'expired';
    if (diffDays <= 30) return 'expiring';
    return 'valid';
  };

  const headerActions = (
    <Button onClick={() => navigate(uploadPath)}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Subir Documento
    </Button>
  );

  return (
    <PageLayout title={title} headerActions={headerActions}>
      {error && <p className="text-red-500 text-center py-2">{error}</p>}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center h-full">
          <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay documentos</h3>
          <p className="text-gray-500 mb-4">Comience subiendo su primer documento QR.</p>
          <Button onClick={() => navigate(uploadPath)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Subir primer documento
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Archivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(doc => {
                const expirationDate = calculateExpiration(doc.extractedDate);
                return (
                  <TableRow key={doc.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium truncate max-w-md">{doc.pdfFileName}</TableCell>
                    <TableCell>
                      <StatusBadge status={getStatus(expirationDate)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => {
                            if (doc.pdfUrl) {
                              window.open(doc.pdfUrl, '_blank');
                            } else {
                              alert('No hay PDF disponible para este documento. Suba un nuevo documento con PDF.');
                            }
                          }}
                          title="Ver PDF"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(editPath.replace(':id', doc.id))}
                          title="Editar"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  );
};

export default QRModuleListPage;