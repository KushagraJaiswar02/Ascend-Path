import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/auth/login" replace />;
  }

  const learnerRoles = ['user', 'explorer', 'pathfinder'];
  if (
    user &&
    learnerRoles.includes(user.role) &&
    !user.onboardingCompleted &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};
