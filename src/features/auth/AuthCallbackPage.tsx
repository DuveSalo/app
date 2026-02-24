import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { ROUTE_PATHS } from '../../constants/index';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as api from '@/lib/api/services';
import { createLogger } from '../../lib/utils/logger';
import { getTrialStatus } from '../../lib/utils/trial';

const logger = createLogger('AuthCallbackPage');

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Error getting session', error);
          navigate(ROUTE_PATHS.LOGIN);
          return;
        }

        if (!session) {
          logger.warn('No session found in callback');
          navigate(ROUTE_PATHS.LOGIN);
          return;
        }

        // Check if the user has a company
        const user = session.user;
        try {
          const company = await api.getCompanyByUserId(user.id);
          const trialStatus = getTrialStatus(company);
          if (company.isSubscribed || trialStatus === 'active') {
            navigate(ROUTE_PATHS.DASHBOARD);
          } else if (trialStatus === 'expired') {
            navigate(ROUTE_PATHS.TRIAL_EXPIRED);
          } else {
            navigate(ROUTE_PATHS.SUBSCRIPTION);
          }
        } catch {
          // User doesn't have a company yet, redirect to create company
          navigate(ROUTE_PATHS.CREATE_COMPANY);
        }
      } catch (error) {
        logger.error('Error in auth callback', error);
        navigate(ROUTE_PATHS.LOGIN);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Completando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
