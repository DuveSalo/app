import { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { ROUTE_PATHS } from '../constants/index';
import { SpinnerPage } from '../components/common/SpinnerPage';
import { getTrialStatus } from '../lib/utils/trial';

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { currentUser, currentCompany, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SpinnerPage />;
  }

  // Level 1: Must be authenticated
  if (!currentUser) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // Level 2: Must have a company
  if (!currentCompany) {
    if (location.pathname === ROUTE_PATHS.CREATE_COMPANY) {
      return children;
    }
    return <Navigate to={ROUTE_PATHS.CREATE_COMPANY} state={{ from: location }} replace />;
  }

  const trialStatus = getTrialStatus(currentCompany);

  // Level 3: Must have access (subscribed OR trial active)
  if (!currentCompany.isSubscribed && trialStatus !== 'active') {
    const allowedPaths: string[] = [
      ROUTE_PATHS.SUBSCRIPTION,
      ROUTE_PATHS.TRIAL_EXPIRED,
      ROUTE_PATHS.CREATE_COMPANY,
      ROUTE_PATHS.SETTINGS,
    ];
    if (allowedPaths.includes(location.pathname)) {
      return children;
    }
    if (trialStatus === 'expired') {
      return <Navigate to={ROUTE_PATHS.TRIAL_EXPIRED} replace />;
    }
    return <Navigate to={ROUTE_PATHS.SUBSCRIPTION} state={{ from: location }} replace />;
  }

  // Level 4: Subscribed/trial-active users shouldn't visit auth/onboarding pages
  if (
    location.pathname === ROUTE_PATHS.LOGIN ||
    location.pathname === ROUTE_PATHS.REGISTER ||
    location.pathname === ROUTE_PATHS.CREATE_COMPANY ||
    location.pathname === ROUTE_PATHS.SUBSCRIPTION ||
    location.pathname === ROUTE_PATHS.TRIAL_EXPIRED
  ) {
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;
