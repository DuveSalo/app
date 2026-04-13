import { useNavigate } from 'react-router-dom';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getTrialDaysRemaining, getTrialStatus } from '../../lib/utils/trial';
import { ROUTE_PATHS } from '../../constants/index';

/**
 * Sidebar card showing trial days remaining.
 * Two visual states: normal (>3 days) and urgent (<=3 days).
 * Renders null if not in active trial.
 */
export const TrialSidebarCard = () => {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  const trialStatus = getTrialStatus(currentCompany);
  const daysRemaining = getTrialDaysRemaining(currentCompany);

  if (trialStatus !== 'active') return null;

  const isUrgent = daysRemaining <= 3;
  const dayText = daysRemaining === 1 ? 'día' : 'días';

  return (
    <div className="px-3 pb-3">
      <div
        className={`relative rounded-lg overflow-hidden p-3 transition-all duration-200 ${
          isUrgent
            ? 'bg-gradient-to-br from-amber-500 to-amber-600'
            : 'bg-gradient-to-br from-neutral-800 to-neutral-900'
        }`}
      >
        {/* Decorative glow */}
        <div
          className={`pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30 ${
            isUrgent ? 'bg-amber-300' : 'bg-white'
          }`}
        />

        {/* Header row: icon + label */}
        <div className="relative flex items-center gap-1.5 mb-2">
          {isUrgent ? (
            <Clock className="w-3.5 h-3.5 text-amber-100 flex-shrink-0" strokeWidth={2} />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={2} />
          )}
          <span
            className={`text-xs font-medium ${isUrgent ? 'text-amber-100' : 'text-neutral-400'}`}
          >
            Período de prueba
          </span>
        </div>

        {/* Days counter */}
        <div className="relative flex items-baseline gap-1.5 mb-3">
          <span className="text-2xl font-bold tracking-tight leading-none text-white">
            {daysRemaining}
          </span>
          <span className={`text-sm ${isUrgent ? 'text-amber-100' : 'text-neutral-300'}`}>
            {dayText} restantes
          </span>
        </div>

        {/* CTA button */}
        <button
          onClick={() => navigate(`${ROUTE_PATHS.SETTINGS}?tab=billing`)}
          className={`relative w-full flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium h-8 transition-all duration-150 ${
            isUrgent
              ? 'bg-white text-amber-700 hover:bg-amber-50'
              : 'bg-white text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Suscribirse
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

/**
 * Compact inline version for mobile nav drawer.
 * Shows a single-line trial indicator with navigate action.
 */
export const TrialMobileIndicator = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  const trialStatus = getTrialStatus(currentCompany);
  const daysRemaining = getTrialDaysRemaining(currentCompany);

  if (trialStatus !== 'active') return null;

  const isUrgent = daysRemaining <= 3;
  const dayText = daysRemaining === 1 ? 'día' : 'días';

  return (
    <div className="px-2 pb-2">
      <button
        onClick={() => {
          onNavigate?.();
          navigate(`${ROUTE_PATHS.SETTINGS}?tab=billing`);
        }}
        className={`w-full flex items-center justify-between rounded-lg p-2.5 transition-all duration-150 ${
          isUrgent
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
            : 'bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <Clock className="w-3.5 h-3.5 text-amber-100 flex-shrink-0" strokeWidth={2} />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={2} />
          )}
          <span
            className={`text-xs font-medium ${isUrgent ? 'text-amber-100' : 'text-neutral-300'}`}
          >
            <span className="font-bold text-white">{daysRemaining}</span> {dayText} de prueba
          </span>
        </div>
        <span className="text-xs font-medium text-white flex items-center gap-1">
          Suscribirse
          <ArrowRight className="w-3 h-3" />
        </span>
      </button>
    </div>
  );
};
