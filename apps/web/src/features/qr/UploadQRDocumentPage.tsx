import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDocumentType } from '../../types/index';
import * as api from '@/lib/api/services';
import { Button } from '../../components/common/Button';
import { FileUpload } from '../../components/common/FileUpload';
import { DatePicker } from '../../components/common/DatePicker';
import PageLayout from '../../components/layout/PageLayout';

interface UploadQRDocumentPageProps {
  qrType: QRDocumentType;
  title: string;
  listPath: string;
}

const UploadQRDocumentPage = ({ qrType, title, listPath }: UploadQRDocumentPageProps) => {
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

  const handleSubmit = async (e: FormEvent) => {
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
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error al subir el documento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = `Subir Archivo para ${title}`;
  const footerActions = (
    <>
      <Button type="button" variant="outline" onClick={() => navigate(listPath)} disabled={isSubmitting}>Cancelar</Button>
      <Button form="upload-form" type="submit" loading={isSubmitting} disabled={!fileToUpload || !extractedDate || isSubmitting}>Subir</Button>
    </>
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl space-y-6">
          <form id="upload-form" onSubmit={handleSubmit} className="space-y-5">
            <FileUpload
              label="Seleccionar Documento (Imagen o PDF)"
              accept=".pdf,.png,.jpg,.jpeg"
              onFileSelect={handleFileSelect}
              currentFileName={fileToUpload?.name}
            />
            <DatePicker
              label="Fecha de Emisión del Documento"
              id="extractedDate"
              value={extractedDate}
              onChange={setExtractedDate}
              helperText="El vencimiento se calculará a 1 año de esta fecha."
              required
              disabled={!fileToUpload}
            />
            {formError && <p className="text-sm text-red-600 mt-2">{formError}</p>}
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default UploadQRDocumentPage;
