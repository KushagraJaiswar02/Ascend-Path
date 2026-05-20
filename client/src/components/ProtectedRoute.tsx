import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/auth/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};
