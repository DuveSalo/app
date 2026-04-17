import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hourglass, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/AuthContext';
import { getTrialDaysRemaining, getTrialStatus } from '../../lib/utils/trial';
import { ROUTE_PATHS } from '../../constants/index';
import { queryKeys } from '@/lib/queryKeys';
import * as api from '@/lib/api/services';
import type { Subscription } from '@/types/subscription';

const CARD_CLASS =
  'relative rounded-lg overflow-hidden p-3 bg-gradient-to-br from-neutral-800 to-neutral-900 transition-all duration-200';
const CARD_GLOW_CLASS =
  'pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30 bg-white';
const CARD_BUTTON_CLASS =
  'relative w-full flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium h-8 bg-white text-neutral-900 hover:bg-neutral-100 transition-all duration-150';
const MOBILE_BUTTON_CLASS =
  'w-full flex items-center justify-between rounded-lg p-2.5 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 transition-all duration-150';

const useActiveSubscription = (companyId: string): Subscription | null => {
  const { data = null } = useQuery({
    queryKey: queryKeys.subscription(companyId),
    queryFn: () => api.getActiveSubscription(companyId),
    enabled: !!companyId,
  });
  return data;
};

type SidebarStatusCardProps =
  | {
      readonly variant: 'trial';
      readonly daysRemaining: number;
      readonly onNavigate: () => void;
    }
  | {
      readonly variant: 'payment-review';
      readonly onNavigate: () => void;
    };

const SidebarStatusCard = (props: SidebarStatusCardProps) => {
  const isTrial = props.variant === 'trial';
  const Icon = isTrial ? Sparkles : Hourglass;
  const title = isTrial ? 'Período de prueba' : 'Pago en revisión';
  const actionLabel = isTrial ? 'Suscribirse' : 'Ver estado';

  return (
    <div className="px-3 pb-3">
      <div className={CARD_CLASS}>
        <div className={CARD_GLOW_CLASS} />

        <div className="relative flex items-center gap-1.5 mb-2">
          <Icon className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={2} />
          <span className="text-xs font-medium text-neutral-400">{title}</span>
        </div>

        {isTrial ? (
          <TrialCountdownContent daysRemaining={props.daysRemaining} />
        ) : (
          <PaymentReviewContent />
        )}

        <button onClick={props.onNavigate} className={CARD_BUTTON_CLASS}>
          {actionLabel}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const TrialCountdownContent = ({ daysRemaining }: { readonly daysRemaining: number }) => {
  const dayText = daysRemaining === 1 ? 'día' : 'días';

  return (
    <div className="relative flex items-baseline gap-1.5 mb-3">
      <span className="text-2xl font-bold tracking-tight leading-none text-white">
        {daysRemaining}
      </span>
      <span className="text-sm text-neutral-300">{dayText} restantes</span>
    </div>
  );
};

const PaymentReviewContent = () => (
  <p className="relative mb-3 text-xs text-neutral-300 leading-snug">
    Estamos verificando tu transferencia. Te avisamos por email.
  </p>
);

/**
 * Sidebar card for account payment/trial status.
 * Priority:
 * 1. Pending payment review: shown for trial or subscribed companies with approval_pending payment.
 * 2. Active trial: shown when no payment is pending and trial is active.
 * 3. Otherwise renders null.
 */
export const TrialSidebarCard = () => {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();
  const subscription = useActiveSubscription(currentCompany?.id ?? '');
  const trialStatus = getTrialStatus(currentCompany);
  const daysRemaining = getTrialDaysRemaining(currentCompany);
  const isTrialActive = trialStatus === 'active';

  if (subscription?.status === 'approval_pending') {
    return (
      <SidebarStatusCard
        variant="payment-review"
        onNavigate={() => navigate(`${ROUTE_PATHS.SETTINGS}?tab=billing`)}
      />
    );
  }

  if (!isTrialActive) return null;

  return (
    <SidebarStatusCard
      variant="trial"
      daysRemaining={daysRemaining}
      onNavigate={() => navigate(`${ROUTE_PATHS.SETTINGS}?tab=billing`)}
    />
  );
};

type MobileStatusIndicatorProps =
  | {
      readonly variant: 'trial';
      readonly daysRemaining: number;
      readonly onNavigate: () => void;
    }
  | {
      readonly variant: 'payment-review';
      readonly onNavigate: () => void;
    };

const MobileStatusIndicator = (props: MobileStatusIndicatorProps) => {
  const isTrial = props.variant === 'trial';
  const Icon = isTrial ? Sparkles : Hourglass;
  const label = isTrial ? (
    <TrialMobileLabel daysRemaining={props.daysRemaining} />
  ) : (
    'Pago en revisión'
  );
  const actionLabel = isTrial ? 'Suscribirse' : 'Ver estado';

  return (
    <div className="px-2 pb-2">
      <button onClick={props.onNavigate} className={MOBILE_BUTTON_CLASS}>
        <div className="min-w-0 flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={2} />
          <span className="truncate text-xs font-medium text-neutral-300">{label}</span>
        </div>
        <span className="text-xs font-medium text-white flex items-center gap-1 flex-shrink-0">
          {actionLabel}
          <ArrowRight className="w-3 h-3" />
        </span>
      </button>
    </div>
  );
};

const TrialMobileLabel = ({ daysRemaining }: { readonly daysRemaining: number }) => {
  const dayText = daysRemaining === 1 ? 'día' : 'días';

  return (
    <>
      <span className="font-bold text-white">{daysRemaining}</span> {dayText} de prueba
    </>
  );
};

/**
 * Compact inline version for mobile nav drawer.
 * Uses the same neutral visual style as the sidebar card for trial and pending payment states.
 */
export const TrialMobileIndicator = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();
  const subscription = useActiveSubscription(currentCompany?.id ?? '');
  const trialStatus = getTrialStatus(currentCompany);
  const daysRemaining = getTrialDaysRemaining(currentCompany);
  const isTrialActive = trialStatus === 'active';

  const navigateToBilling = () => {
    onNavigate?.();
    navigate(`${ROUTE_PATHS.SETTINGS}?tab=billing`);
  };

  if (subscription?.status === 'approval_pending') {
    return <MobileStatusIndicator variant="payment-review" onNavigate={navigateToBilling} />;
  }

  if (!isTrialActive) return null;

  return (
    <MobileStatusIndicator
      variant="trial"
      daysRemaining={daysRemaining}
      onNavigate={navigateToBilling}
    />
  );
};
