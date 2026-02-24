import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '../../components/common/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import { ExclamationTriangleIcon, CheckCircleIcon } from '../../components/common/Icons';

const TrialExpiredPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <AuthLayout variant="wizard" wizardSteps={['Cuenta', 'Empresa', 'Suscripcion']} currentStep={3}>
      <div className="max-w-md mx-auto w-full text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center mb-6">
          <ExclamationTriangleIcon className="w-7 h-7 text-amber-600" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">
          Tu periodo de prueba ha finalizado
        </h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Tu prueba gratuita de 14 dias ha expirado. Para continuar usando
          Escuela Segura, selecciona un plan de suscripcion.
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8 text-left">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
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
            size="lg"
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
      </div>
    </AuthLayout>
  );
};

export default TrialExpiredPage;
