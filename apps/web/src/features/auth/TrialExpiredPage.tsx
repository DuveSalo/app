import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';

const TrialExpiredPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <AuthLayout variant="wizard" wizardSteps={['Cuenta', 'Empresa', 'Suscripcion']} currentStep={3}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center mb-6">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>

          <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">
            Tu periodo de prueba ha finalizado
          </h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Tu prueba gratuita de 14 dias ha expirado. Para continuar usando
            Escuela Segura, selecciona un plan de suscripcion.
          </p>

          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800">Tus datos estan seguros</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Toda la informacion que cargaste durante la prueba se conserva
                  intacta. Al suscribirte, recuperaras el acceso completo
                  inmediatamente.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION)}
              className="w-full"
            >
              Ver planes y suscribirse
            </Button>
            <Button
              variant="ghost"
              onClick={() => logout()}
              className="w-full"
            >
              Cerrar sesion
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default TrialExpiredPage;
