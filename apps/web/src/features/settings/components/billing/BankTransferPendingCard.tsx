import { Clock } from 'lucide-react';

interface BankTransferPendingCardProps {
  planName: string;
}

export const BankTransferPendingCard = ({ planName }: BankTransferPendingCardProps) => (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Clock className="w-5 h-5 text-amber-600" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-sm font-medium text-amber-900">Pago pendiente de aprobación</h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200">
            En revisión
          </span>
        </div>
        <p className="text-sm text-amber-800">
          Recibimos tu comprobante para el plan <span className="font-medium">{planName}</span>.
          Nuestro equipo está verificando la transferencia y te vamos a notificar por email apenas
          se apruebe. Tu suscripción se activará automáticamente en ese momento.
        </p>
      </div>
    </div>
  </div>
);
