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
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        // Handle Supabase error redirects (e.g., expired or invalid link)
        if (errorParam) {
          logger.error('Auth callback error from Supabase', { error: errorParam, description: errorDescription });
          navigate(ROUTE_PATHS.LOGIN);
          return;
        }

        // The Supabase client (detectSessionInUrl: true) automatically handles
        // PKCE code exchange during initialization. getSession() waits for that
        // to complete, so we don't call exchangeCodeForSession() manually —
        // doing so races with auto-detection and fails when the code_verifier
        // has already been consumed.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Error getting session', error);
          navigate(ROUTE_PATHS.LOGIN);
          return;
        }

        if (!session) {
          // No session after callback — likely the confirmation email was opened
          // in a different browser (PKCE verifier missing on this device).
          // The email is already confirmed by Supabase, so show a helpful message.
          if (code) {
            logger.warn('No session after callback — likely different browser (PKCE verifier missing)');
            navigate(`${ROUTE_PATHS.LOGIN}?confirmed=true`, { replace: true });
          } else {
            logger.warn('No session found in callback');
            navigate(ROUTE_PATHS.LOGIN);
          }
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
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Completando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
