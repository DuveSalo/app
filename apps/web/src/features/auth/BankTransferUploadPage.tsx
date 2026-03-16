import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import { FileUpload } from '@/components/common/FileUpload';
import { toast } from 'sonner';
import * as api from '../../lib/api/services';

const BankTransferUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selectedFile || !currentCompany) return;

    setIsSubmitting(true);
    setError('');
    try {
      const payment = await api.getLatestManualPayment(currentCompany.id);
      if (!payment) {
        setError('No se encontró un pago pendiente.');
        return;
      }
      await api.uploadReceipt({
        companyId: currentCompany.id,
        paymentId: payment.id,
        file: selectedFile,
      });
      toast.success('Comprobante enviado correctamente');
      navigate(ROUTE_PATHS.BANK_TRANSFER_STATUS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el comprobante.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripción'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={3}>
      <Card className="w-full max-w-[860px]">
        <CardContent className="p-8 flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground text-center">
              Subí tu comprobante
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Adjuntá el comprobante de la transferencia para que podamos verificar tu pago.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground">
              Transferencia a: <span className="font-medium text-foreground">Escuela Segura SRL</span>
            </p>
            <p className="text-xs text-muted-foreground">
              CBU: <span className="font-medium text-foreground">0110599940059901234567</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Alias: <span className="font-medium text-foreground">ESCUELA.SEGURA.PAGOS</span>
            </p>
          </div>

          <FileUpload
            onFileSelect={(file) => setSelectedFile(file)}
            accept=".pdf,.png,.jpg,.jpeg"
            label="Comprobante de transferencia"
          />

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={!selectedFile}
            loading={isSubmitting}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Enviar comprobante
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate(ROUTE_PATHS.BANK_TRANSFER_STATUS)}
            className="w-full"
          >
            Lo subiré más tarde
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default BankTransferUploadPage;
