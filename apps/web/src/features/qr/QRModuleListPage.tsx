import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { QRDocument, QRDocumentType } from '../../types/index';
import * as api from '@/lib/api/services';
import { useAuth } from '../auth/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import PageLayout from '../../components/layout/PageLayout';

interface QRModulePageProps {
  qrType: QRDocumentType;
  title: string;
  uploadPath: string;
  editPath: string;
}

const QRModuleListPage = ({ qrType, title, uploadPath, editPath }: QRModulePageProps) => {
  const [documents, setDocuments] = useState<QRDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { currentCompany } = useAuth();

  const loadDocuments = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getQRDocuments(qrType, currentCompany.id);
      setDocuments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Error al cargar archivos de ${title}`);
    } finally {
      setIsLoading(false);
    }
  }, [qrType, title, currentCompany]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.deleteQRDocument(deleteId);
      setDocuments(prev => prev.filter(doc => doc.id !== deleteId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar el documento.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
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

  const fmtDate = (d: Date) => d.toLocaleDateString('es-AR');

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(uploadPath)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Subir Documento
    </button>
  );

  return (
    <PageLayout title={title} headerActions={headerActions}>
      {error && <p className="text-sm text-red-600 text-center py-2">{error}</p>}
      {isLoading ? (
        <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-sm text-neutral-500">No hay archivos registrados.</p>
          <button
            type="button"
            onClick={() => navigate(uploadPath)}
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Subir primer documento
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-4">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-md border border-neutral-200">
            {/* Desktop Table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="h-11 bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-5 text-xs font-medium text-neutral-900">Nombre Archivo</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[130px]">Vencimiento</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[140px]">Estado</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const expDate = calculateExpiration(doc.extractedDate);
                  return (
                    <tr key={doc.id} className="h-13 border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                      <td className="px-5 truncate">
                        <span className="text-sm text-neutral-900 truncate">{doc.pdfFileName}</span>
                      </td>
                      <td className="px-4 w-[130px]">
                        <span className="text-sm text-neutral-500">{fmtDate(expDate)}</span>
                      </td>
                      <td className="px-4 w-[140px]">
                        <StatusBadge status={getStatus(expDate)} />
                      </td>
                      <td className="px-4 w-[100px]">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                            onClick={() => { if (doc.pdfUrl) window.open(doc.pdfUrl, '_blank'); }}
                            title="Ver PDF"
                          >
                            <Eye className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            type="button"
                            className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                            onClick={() => navigate(editPath.replace(':id', doc.id))}
                            title="Editar"
                          >
                            <Pencil className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            type="button"
                            className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                            onClick={() => setDeleteId(doc.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="sm:hidden">
              {documents.map(doc => {
                const expDate = calculateExpiration(doc.extractedDate);
                return (
                  <div
                    key={doc.id}
                    onClick={() => navigate(editPath.replace(':id', doc.id))}
                    className="flex items-center cursor-pointer hover:bg-neutral-50 transition-colors p-3 gap-3 border-b border-neutral-200"
                  >
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm text-neutral-900 truncate">{doc.pdfFileName}</span>
                        <StatusBadge status={getStatus(expDate)} />
                      </div>
                      <span className="text-xs text-neutral-500">Vence: {fmtDate(expDate)}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm} title="¿Eliminar documento?" message="Esta acción no se puede deshacer." confirmText="Eliminar" cancelText="Cancelar" variant="danger" isLoading={isDeleting} />
    </PageLayout>
  );
};

export default QRModuleListPage;
