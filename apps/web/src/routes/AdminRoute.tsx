import { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { ROUTE_PATHS } from '../constants/index';
import { SpinnerPage } from '../components/common/SpinnerPage';

const AdminRoute = ({ children }: { children: ReactElement }) => {
  const { currentUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <SpinnerPage />;
  }

  if (!currentUser) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }

  return children;
};

export default AdminRoute;
