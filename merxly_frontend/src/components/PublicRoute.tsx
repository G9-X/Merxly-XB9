import { Navigate, useLocation, type Location } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/enums';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (isAuthenticated) {
    const fromLocation = (location.state as { from?: Location })?.from;
    if (fromLocation) {
      return (
        <Navigate
          to={fromLocation.pathname + fromLocation.search}
          state={fromLocation.state}
          replace
        />
      );
    }

    const roles = user?.roles || [];
    if (roles.includes(UserRole.Admin)) {
      return <Navigate to='/admin' replace />;
    }
    if (roles.includes(UserRole.StoreOwner)) {
      return <Navigate to='/store' replace />;
    }

    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};
