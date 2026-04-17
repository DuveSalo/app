import { Clock } from 'lucide-react';
import { calculateDaysUntilExpiration, formatDateLocal } from '@/lib/utils/dateUtils';

interface TrialInfoCardProps {
  trialEndsAt: string;
}

export const TrialInfoCard = ({ trialEndsAt }: TrialInfoCardProps) => {
  const daysRemaining = Math.max(0, calculateDaysUntilExpiration(trialEndsAt));
  const isSingular = daysRemaining === 1;

  return (
    <div className="rounded-lg border border-info/20 bg-info/5 p-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4 text-info" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-medium text-info">Período de prueba</h3>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-info/10 text-info border border-info/30">
              Activo
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Te {isSingular ? 'queda' : 'quedan'}{' '}
            <span className="font-semibold text-info">
              {daysRemaining} {isSingular ? 'día' : 'días'}
            </span>{' '}
            hasta el{' '}
            <span className="font-medium text-foreground">{formatDateLocal(trialEndsAt)}</span>.
            Suscribite antes para mantener el acceso.
          </p>
        </div>
      </div>
    </div>
  );
};
