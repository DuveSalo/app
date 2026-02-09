import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/common/Button';
import { ROUTE_PATHS } from '@/constants';
import { supabase } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

type CallbackStatus = 'loading' | 'success' | 'pending' | 'failure' | 'error';

const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 3000;

const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentCompany, refreshCompany } = useAuth();

  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get MP callback params
  const preapprovalId = searchParams.get('preapproval_id');
  const mpStatus = searchParams.get('status');

  const checkSubscriptionStatus = useCallback(async () => {
    if (!currentCompany?.id) {
      setStatus('error');
      setMessage('No se encontro la empresa asociada');
      return;
    }

    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (subscription?.status === 'authorized') {
        await refreshCompany(true);
        setStatus('success');
        setMessage('Tu suscripcion ha sido activada correctamente');
        setTimeout(() => navigate(ROUTE_PATHS.DASHBOARD), 2000);
      } else if (subscription?.status === 'cancelled' || subscription?.status === 'rejected') {
        setStatus('failure');
        setMessage('El pago no pudo ser procesado');
      } else {
        // pending, or no subscription yet (webhook hasn't fired)
        setStatus('pending');
        setMessage(
          subscription?.status === 'pending'
            ? 'Estamos procesando tu pago. Esto puede tardar unos segundos...'
            : 'Verificando el estado de tu pago...'
        );

        if (retryCount < MAX_RETRIES) {
          timerRef.current = setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, RETRY_INTERVAL_MS);
        }
      }
    } catch (err) {
      console.error('[PaymentCallback] Error:', err);
      setStatus('error');
      setMessage('Error al verificar el estado del pago');
    }
  }, [currentCompany?.id, navigate, refreshCompany, retryCount]);

  useEffect(() => {
    if (mpStatus === 'null' || mpStatus === 'rejected') {
      setStatus('failure');
      setMessage('El pago fue rechazado o cancelado');
      return;
    }

    checkSubscriptionStatus();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mpStatus, checkSubscriptionStatus]);

  const handleRetry = () => {
    setRetryCount(0);
    setStatus('loading');
    checkSubscriptionStatus();
  };

  const handleContinueToDashboard = async () => {
    // Refresh company data one more time — webhook may have arrived
    await refreshCompany(true);
    navigate(ROUTE_PATHS.DASHBOARD);
  };

  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripcion', 'Pago'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={4}>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          {/* Loading / Pending State */}
          {(status === 'loading' || status === 'pending') && (
            <>
              <Loader2 className="w-16 h-16 text-gray-900 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {status === 'loading' ? 'Verificando pago...' : 'Procesando...'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{message}</p>
              {status === 'pending' && retryCount > 0 && retryCount < MAX_RETRIES && (
                <p className="text-xs text-gray-400">
                  Intento {retryCount} de {MAX_RETRIES}...
                </p>
              )}
              {retryCount >= MAX_RETRIES && (
                <div className="mt-4 space-y-3">
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm text-amber-700">
                      Tu pago fue registrado. La activacion puede demorar unos minutos.
                    </p>
                  </div>
                  <Button onClick={handleContinueToDashboard}>
                    Continuar al dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="text-sm text-gray-400 hover:text-gray-500"
                    >
                      Reintentar verificacion
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Pago exitoso
              </h2>
              <p className="text-sm text-gray-500 mb-4">{message}</p>
              <p className="text-xs text-gray-400">
                Redirigiendo al dashboard...
              </p>
            </>
          )}

          {/* Failure State */}
          {status === 'failure' && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Pago no completado
              </h2>
              <p className="text-sm text-gray-500 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION)}>
                  Intentar con otro metodo
                </Button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATHS.LOGIN)}
                  className="text-sm text-gray-400 hover:text-gray-500"
                >
                  Volver al inicio
                </button>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error de verificacion
              </h2>
              <p className="text-sm text-gray-500 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION)}
                  className="text-sm text-gray-400 hover:text-gray-500"
                >
                  Volver a suscripciones
                </button>
              </div>
            </>
          )}
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && preapprovalId && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p>Preapproval ID: {preapprovalId}</p>
            <p>MP Status: {mpStatus || 'N/A'}</p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default PaymentCallbackPage;
