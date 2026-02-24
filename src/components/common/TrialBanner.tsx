import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
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
    : 'bg-blue-50 border-blue-200 text-blue-800';
  const buttonClasses = isUrgent
    ? 'bg-amber-600 hover:bg-amber-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  const dayText = daysRemaining === 1 ? 'dia' : 'dias';

  return (
    <div className={`flex items-center justify-between px-4 py-2 border-b text-sm ${bannerClasses}`}>
      <p className="font-medium">
        Prueba gratuita: te {daysRemaining === 1 ? 'queda' : 'quedan'}{' '}
        <span className="font-semibold">{daysRemaining} {dayText}</span>
      </p>
      <button
        onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION)}
        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${buttonClasses}`}
      >
        Suscribirse ahora
      </button>
    </div>
  );
};
