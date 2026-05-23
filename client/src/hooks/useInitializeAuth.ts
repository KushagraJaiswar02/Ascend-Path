import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../services/apiClient';

export function useInitializeAuth() {
  const { isAuthenticated, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!isAuthenticated) {
        setIsInitializing(false);
        return;
      }

      // If Zustand says we are authenticated, but we don't have an accessToken in memory (due to a page refresh),
      // we need to call /auth/me to restore the session.
      try {
        const { data } = await apiClient.get('/auth/me');
        // The interceptor will automatically handle silent refresh if the access token is missing.
        // If it succeeds, /auth/me returns the user profile.
        
        // We need the token here to put back into Zustand. 
        // Wait, /auth/me doesn't return the token, it returns the user.
        // The silent refresh interceptor ALREADY put the new token into Zustand memory!
        // So we just need to update the user object.
        
        useAuthStore.setState({ user: data.data.user, isAuthenticated: true });
      } catch (error) {
        // If it fails (e.g., no valid refresh cookie), ensure we are logged out.
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [isAuthenticated, logout]);

  return { isInitializing };
}
