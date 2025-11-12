
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDocumentType } from '../../types/index';
import * as api from '../../lib/api/supabaseApi';
import { Button } from '../../components/common/Button';
import { FileUpload } from '../../components/common/FileUpload';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import PageLayout from '../../components/layout/PageLayout';

interface UploadQRDocumentPageProps {
  qrType: QRDocumentType;
  title: string;
  listPath: string;
}

const UploadQRDocumentPage: React.FC<UploadQRDocumentPageProps> = ({ qrType, title, listPath }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  const [extractedDate, setExtractedDate] = useState('');

  const handleFileSelect = (file: File | null) => {
    setFileToUpload(file);
    setFormError('');
    if (file) {
      setExtractedDate(new Date().toISOString().split('T')[0]);
    } else {
      setExtractedDate('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setFormError("Por favor, seleccione un archivo.");
      return;
    }
    if (!extractedDate) {
      setFormError("Por favor, ingrese o verifique la fecha de emisión del documento.");
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      await api.uploadQRDocument({
        type: qrType,
        documentName: fileToUpload.name,
        pdfFile: fileToUpload,
        pdfFileName: fileToUpload.name,
        extractedDate: extractedDate,
      });
      navigate(listPath);
    } catch (err: any) {
      setFormError((err as Error).message || "Error al subir el documento.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const pageTitle = `Subir Documento QR para ${title}`;
  const footerActions = (
    <>
      <Button type="button" variant="outline" onClick={() => navigate(listPath)} disabled={isSubmitting}>Cancelar</Button>
      <Button form="upload-form" type="submit" loading={isSubmitting} disabled={!fileToUpload || !extractedDate || isSubmitting}>Subir</Button>
    </>
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <form id="upload-form" onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
        <FileUpload
          label="Seleccionar Documento (Imagen o PDF)"
          accept=".pdf,.png,.jpg,.jpeg"
          onFileSelect={handleFileSelect}
          currentFileName={fileToUpload?.name}
        />
        {fileToUpload && (
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
        )}
        {formError && <p className="text-sm text-red-600 mt-2 text-center">{formError}</p>}
      </form>
    </PageLayout>
  );
};

export default UploadQRDocumentPage;