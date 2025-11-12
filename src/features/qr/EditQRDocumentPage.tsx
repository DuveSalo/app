
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRDocumentType } from '../../types/index';
import * as api from '../../lib/api/supabaseApi';
import { Button } from '../../components/common/Button';
import { FileUpload } from '../../components/common/FileUpload';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EyeIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';

interface EditQRDocumentPageProps {
  qrType: QRDocumentType;
  title: string;
  listPath: string;
}

const EditQRDocumentPage: React.FC<EditQRDocumentPageProps> = ({ qrType, title, listPath }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('');
  const [extractedDate, setExtractedDate] = useState('');

  const loadDocument = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const doc = await api.getQRDocumentById(id);
      setExtractedDate(doc.extractedDate);
      setCurrentFileName(doc.pdfFileName || '');
      setCurrentPdfUrl(doc.pdfUrl || '');
    } catch (err: any) {
      setFormError((err as Error).message || "Error al cargar el documento.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleFileSelect = (file: File | null) => {
    setFileToUpload(file);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!extractedDate) {
      setFormError("Por favor, ingrese la fecha de emisión del documento.");
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await api.updateQRDocument(id, {
        type: qrType,
        documentName: fileToUpload?.name || currentFileName,
        pdfFile: fileToUpload,
        pdfFileName: fileToUpload?.name || currentFileName,
        extractedDate: extractedDate,
      });
      navigate(listPath);
    } catch (err: any) {
      setFormError((err as Error).message || "Error al actualizar el documento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = `Editar Documento QR - ${title}`;
  const footerActions = (
    <>
      <Button type="button" variant="outline" onClick={() => navigate(listPath)} disabled={isSubmitting}>Cancelar</Button>
      <Button form="edit-form" type="submit" loading={isSubmitting} disabled={!extractedDate || isSubmitting}>Guardar cambios</Button>
    </>
  );

  if (isLoading) {
    return (
      <PageLayout title={pageTitle}>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <form id="edit-form" onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
        <Card className="p-4 bg-gray-50 border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Archivo actual</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{currentFileName || 'Sin archivo'}</p>
            {currentPdfUrl && (
              <button
                type="button"
                className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                onClick={() => window.open(currentPdfUrl, '_blank')}
                title="Ver PDF actual"
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                Ver PDF
              </button>
            )}
          </div>
        </Card>

        <FileUpload
          label="Reemplazar Documento (opcional)"
          accept=".pdf,.png,.jpg,.jpeg"
          onFileSelect={handleFileSelect}
          currentFileName={fileToUpload?.name}
        />

        <Card className="p-4 bg-gray-50 border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Fecha de Emisión</h3>
          <Input
            label="Fecha de Emisión del Documento"
            id="extractedDate"
            type="date"
            value={extractedDate}
            onChange={(e) => setExtractedDate(e.target.value)}
            helperText="El vencimiento se calculará a 1 año de esta fecha."
            required
          />
        </Card>

        {formError && <p className="text-sm text-red-600 mt-2 text-center">{formError}</p>}
      </form>
    </PageLayout>
  );
};

export default EditQRDocumentPage;
