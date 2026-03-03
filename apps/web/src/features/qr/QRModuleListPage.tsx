import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, ChevronRight, Download } from 'lucide-react';
import { QRDocument, QRDocumentType } from '../../types/index';
import * as api from '@/lib/api/services';
import { useAuth } from '../auth/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import PageLayout from '../../components/layout/PageLayout';
import { SplitPaneLayout } from '../../components/layout/SplitPaneLayout';

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    if (selectedId === deleteId) setSelectedId(null);
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

  const STATUS_DOT: Record<string, string> = {
    valid: 'bg-emerald-600',
    expiring: 'bg-amber-600',
    expired: 'bg-red-600',
  };

  useEffect(() => {
    if (documents.length > 0 && !selectedId) setSelectedId(documents[0].id);
  }, [documents, selectedId]);

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(uploadPath)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium focus:outline-none hover:bg-neutral-900 transition-colors"
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
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium focus:outline-none hover:bg-neutral-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Subir primer documento
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-4">
          {/* ── Desktop: Split Pane ── */}
          <div className="hidden sm:flex flex-1 min-h-0">
            <SplitPaneLayout
              items={documents}
              selectedId={selectedId}
              onSelect={setSelectedId}
              listLabel="Documentos"
              renderListItem={(doc, isSelected) => {
                const expDate = calculateExpiration(doc.extractedDate);
                const status = getStatus(expDate);
                return (
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm truncate ${isSelected ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-900'}`}>
                        {doc.pdfFileName}
                      </h3>
                      <div className={`h-2 w-2 flex-shrink-0 ${STATUS_DOT[status]}`} />
                    </div>
                    <p className="text-xs text-neutral-500">Vence: {fmtDate(expDate)}</p>
                  </div>
                );
              }}
              renderDetail={(doc) => {
                const expDate = calculateExpiration(doc.extractedDate);
                const status = getStatus(expDate);
                return (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={status} />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                          {doc.pdfFileName}
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        {doc.pdfUrl && (
                          <button
                            onClick={() => window.open(doc.pdfUrl, '_blank')}
                            className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
                            title="Ver PDF"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(editPath.replace(':id', doc.id))}
                          className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
                          title="Editar"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(doc.id)}
                          className="p-2 border border-neutral-200 hover:bg-neutral-50 text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-12">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-neutral-500">Fecha Extraída</p>
                        <p className="text-sm text-neutral-900">{new Date(doc.extractedDate).toLocaleDateString('es-AR')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-neutral-500">Vencimiento</p>
                        <p className="text-sm text-neutral-900">{fmtDate(expDate)}</p>
                      </div>
                    </div>

                    {/* Document Preview */}
                    {doc.pdfUrl && (
                      <div className="flex-1 flex flex-col">
                        <h4 className="text-xs font-medium text-neutral-500 mb-4">
                          Documento Adjunto
                        </h4>
                        <div className="flex-1 bg-neutral-50 border border-dashed border-neutral-200 flex items-center justify-center relative group min-h-[200px]">
                          <div className="absolute inset-0 bg-neutral-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => window.open(doc.pdfUrl, '_blank')}
                              className="bg-white text-neutral-900 font-bold py-2 px-6  flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Ver Documento Completo
                            </button>
                          </div>
                          <p className="text-xs text-neutral-400">Pase el cursor para ver el documento</p>
                        </div>
                      </div>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* ── Mobile Cards ── */}
          <div className="sm:hidden min-h-0 overflow-y-auto custom-scrollbar border border-neutral-200">
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
      )}

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm} title="¿Eliminar documento?" message="Esta acción no se puede deshacer." confirmText="Eliminar" cancelText="Cancelar" variant="danger" isLoading={isDeleting} />
    </PageLayout>
  );
};

export default QRModuleListPage;
