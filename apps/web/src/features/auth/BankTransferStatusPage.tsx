import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import { getLatestManualPayment } from '../../lib/api/services/bankTransfer';
import { Skeleton } from '../../components/common/SkeletonLoader';
import type { RealtimeChannel } from '@supabase/supabase-js';

type PaymentStatus = 'pending' | 'approved' | 'rejected';

interface PaymentState {
  status: PaymentStatus;
  rejectionReason: string | null;
  receiptUrl: string | null;
}

const FALLBACK_POLL_INTERVAL = 60_000;

const BankTransferStatusPage = () => {
  const navigate = useNavigate();
  const { currentCompany: company, logout, refreshCompany } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRedirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchPayment = useCallback(async () => {
    if (!company?.id) return;
    try {
      const data = await getLatestManualPayment(company.id);
      if (!data) {
        navigate(ROUTE_PATHS.SUBSCRIPTION, { replace: true });
        return;
      }
      setPayment({
        status: data.status as PaymentStatus,
        rejectionReason: data.rejectionReason ?? null,
        receiptUrl: data.receiptUrl ?? null,
      });
    } catch {
      // Silently ignore poll errors
    } finally {
      setLoading(false);
    }
  }, [company?.id, navigate]);

  // Set up Realtime subscription + fallback polling
  useEffect(() => {
    if (!company?.id) return;

    fetchPayment();

    // Realtime subscription for instant updates
    const channel = supabase
      .channel(`bank-transfer:${company.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'manual_payments',
          filter: `company_id=eq.${company.id}`,
        },
        () => {
          fetchPayment();
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Fallback poll every 60s in case Realtime connection drops
    intervalRef.current = setInterval(fetchPayment, FALLBACK_POLL_INTERVAL);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoRedirectRef.current) clearTimeout(autoRedirectRef.current);
    };
  }, [company?.id, fetchPayment]);

  // Stop polling/realtime and auto-redirect when status is terminal
  useEffect(() => {
    if (payment?.status === 'approved' || payment?.status === 'rejected') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }

    if (payment?.status === 'approved') {
      autoRedirectRef.current = setTimeout(async () => {
        await refreshCompany(true);
        navigate(ROUTE_PATHS.DASHBOARD, { replace: true });
      }, 3000);
    }

    return () => {
      if (autoRedirectRef.current) clearTimeout(autoRedirectRef.current);
    };
  }, [payment?.status, refreshCompany, navigate]);

  const handleGoToDashboard = async () => {
    await refreshCompany(true);
    navigate(ROUTE_PATHS.DASHBOARD, { replace: true });
  };

  if (loading) {
    return (
      <AuthLayout
        variant="wizard"
        wizardSteps={['Cuenta', 'Empresa', 'Suscripción']}
        currentStep={3}
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="mx-auto h-14 w-14 rounded-lg" />
            <Skeleton className="mx-auto h-6 w-2/3" />
            <Skeleton className="mx-auto h-4 w-full" />
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  if (!payment) return null;

  return (
    <AuthLayout variant="wizard" wizardSteps={['Cuenta', 'Empresa', 'Suscripción']} currentStep={3}>
      {payment?.status === 'rejected' ? (
        <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Pago rechazado</AlertDialogTitle>
              <AlertDialogDescription>
                Tu comprobante de transferencia fue rechazado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {payment.rejectionReason ? (
              <div className="rounded-lg bg-muted border border-border p-3 text-left">
                <p className="text-sm text-muted-foreground">{payment.rejectionReason}</p>
              </div>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowRejectionDialog(false)}>
                Entendido
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {payment.status === 'pending' && (
            <>
              <div className="mx-auto h-14 w-14 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
                Pago pendiente de verificacion
              </h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Recibimos tu comprobante. Estamos verificando el pago. Te notificaremos cuando sea
                aprobado.
              </p>
              <div className="space-y-3">
                {!payment.receiptUrl && (
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.BANK_TRANSFER_UPLOAD)}
                    className="w-full"
                  >
                    Subir comprobante
                  </Button>
                )}
                <Button variant="ghost" onClick={() => logout()} className="w-full">
                  Cerrar sesión
                </Button>
              </div>
            </>
          )}

          {payment.status === 'approved' && (
            <>
              <div className="mx-auto h-14 w-14 rounded-lg bg-emerald-50 border border-emerald-200/50 flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
                Pago aprobado!
              </h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Tu suscripción está activa. Ya podés usar todas las funcionalidades.
              </p>
              <div className="space-y-3">
                <Button onClick={handleGoToDashboard} className="w-full">
                  Ir al dashboard
                </Button>
              </div>
            </>
          )}

          {payment.status === 'rejected' && (
            <>
              <div className="mx-auto h-14 w-14 rounded-lg bg-red-50 border border-red-200/50 flex items-center justify-center mb-6">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
                Pago rechazado
              </h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Tu comprobante fue rechazado.
              </p>
              {payment.rejectionReason && (
                <div className="rounded-lg bg-muted border border-border p-3 mb-8 text-left">
                  <p className="text-sm text-muted-foreground">{payment.rejectionReason}</p>
                </div>
              )}
              {!payment.rejectionReason && <div className="mb-4" />}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(ROUTE_PATHS.BANK_TRANSFER_UPLOAD)}
                  className="w-full"
                >
                  Subir nuevo comprobante
                </Button>
                <Button variant="ghost" onClick={() => logout()} className="w-full">
                  Cerrar sesión
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default BankTransferStatusPage;
