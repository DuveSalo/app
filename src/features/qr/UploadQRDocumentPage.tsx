
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRDocumentType } from '../../types/index';
import * as api from '../../lib/api/supabaseApi';
import { Button } from '../../components/common/Button';
import { FileUpload } from '../../components/common/FileUpload';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { GoogleGenAI } from "@google/genai";
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
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  const fileToBas64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  }

  const runOCRDetection = async (file: File) => {
    if (!file.type.startsWith('image/')) {
        setOcrError('La extracción automática de fecha solo funciona con imágenes (PNG, JPG). Por favor, ingrese la fecha manualmente para archivos PDF.');
        setExtractedDate(new Date().toISOString().split('T')[0]);
        return;
    }

    setIsOcrLoading(true);
    setOcrError('');
    setExtractedDate('');

    try {
        const base64Data = await fileToBas64(file);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const imagePart = {
            inlineData: { mimeType: file.type, data: base64Data },
        };
        const textPart = { text: "Extract the main date from this document in YYYY-MM-DD format. If no date is found, respond with 'N/A'." };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const dateText = response.text.trim();

        if (dateText === 'N/A' || !/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
            setOcrError('No se pudo extraer una fecha válida. Por favor, ingrésela manualmente.');
            setExtractedDate(new Date().toISOString().split('T')[0]);
        } else {
            setExtractedDate(dateText);
        }
    } catch (error) {
        console.error("Error during OCR detection:", error);
        setOcrError('Ocurrió un error durante el OCR. Por favor, ingrese la fecha manualmente.');
        setExtractedDate(new Date().toISOString().split('T')[0]);
    } finally {
        setIsOcrLoading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFileToUpload(file);
    setFormError('');
    if (file) {
      runOCRDetection(file);
    } else {
      setExtractedDate('');
      setOcrError('');
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
      <Button form="upload-form" type="submit" loading={isSubmitting} disabled={!fileToUpload || !extractedDate || isSubmitting || isOcrLoading}>Subir</Button>
    </>
  );

  return (
    <PageLayout title={pageTitle} footer={footerActions}>
      <form id="upload-form" onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
        <FileUpload
          label="Seleccionar Documento (Imagen o PDF)"
          accept=".pdf,.png,.jpg,.jpeg"
          onFileSelect={handleFileSelect}
          currentFileName={fileToUpload?.name}
        />
        {fileToUpload && (
            <Card className="p-4 bg-gray-50 border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Verificación de Fecha</h3>
                {isOcrLoading ? (
                    <div className="flex items-center space-x-3 text-gray-600">
                        <LoadingSpinner size="sm" />
                        <span>Analizando documento con IA...</span>
                    </div>
                ) : (
                    <>
                        {ocrError && <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-md mb-3">{ocrError}</p>}
                        <Input
                            label="Fecha de Emisión del Documento"
                            id="extractedDate"
                            type="date"
                            value={extractedDate}
                            onChange={(e) => setExtractedDate(e.target.value)}
                            helperText="Verifique que esta sea la fecha correcta. El vencimiento se calculará a 1 año de esta fecha."
                            required
                        />
                    </>
                )}
            </Card>
        )}
        {formError && <p className="text-sm text-red-600 mt-2 text-center">{formError}</p>}
      </form>
    </PageLayout>
  );
};

export default UploadQRDocumentPage;