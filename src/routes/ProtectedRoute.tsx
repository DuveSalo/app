

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { ROUTE_PATHS } from '../constants/index';
import { SpinnerPage } from '../components/common/SpinnerPage';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { currentUser, currentCompany, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SpinnerPage />;
  }

  if (!currentUser) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />;
  }

  if (!currentCompany) {
    if (location.pathname === ROUTE_PATHS.CREATE_COMPANY) {
      return children;
    }
    return <Navigate to={ROUTE_PATHS.CREATE_COMPANY} state={{ from: location }} replace />;
  }

  if (!currentCompany.isSubscribed) {
    if (location.pathname === ROUTE_PATHS.SUBSCRIPTION || location.pathname === ROUTE_PATHS.CREATE_COMPANY) {
      return children;
    }
    return <Navigate to={ROUTE_PATHS.SUBSCRIPTION} state={{ from: location }} replace />;
  }
  
  if ( location.pathname === ROUTE_PATHS.LOGIN ||
       location.pathname === ROUTE_PATHS.REGISTER ||
       location.pathname === ROUTE_PATHS.CREATE_COMPANY ||
       location.pathname === ROUTE_PATHS.SUBSCRIPTION
  ) {
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;