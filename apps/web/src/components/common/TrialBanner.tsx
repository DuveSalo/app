import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { getTrialDaysRemaining, getTrialStatus } from '../../lib/utils/trial';
import { ROUTE_PATHS } from '../../constants/index';

export const TrialBanner = () => {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  const trialStatus = getTrialStatus(currentCompany);
  const daysRemaining = getTrialDaysRemaining(currentCompany);

  if (trialStatus !== 'active') return null;

  const isUrgent = daysRemaining <= 3;
  const bannerClasses = isUrgent
    ? 'bg-amber-50 border-amber-200 text-amber-800'
    : 'bg-neutral-50 border-neutral-200 text-neutral-900';
  const buttonClasses = isUrgent
    ? 'bg-amber-600 hover:bg-amber-700 text-white'
    : 'bg-primary hover:bg-primary/90 text-white';

  const dayText = daysRemaining === 1 ? 'dia' : 'dias';

  return (
    <div className={`flex items-center justify-between h-9 px-4 border-b text-sm ${bannerClasses}`}>
      <p className="font-medium">
        Prueba gratuita: te {daysRemaining === 1 ? 'queda' : 'quedan'}{' '}
        <span className="font-semibold">{daysRemaining} {dayText}</span>
      </p>
      <button
        onClick={() => navigate(`${ROUTE_PATHS.SETTINGS}?tab=billing`)}
        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 ${buttonClasses}`}
      >
        Suscribirse ahora
      </button>
    </div>
  );
};
