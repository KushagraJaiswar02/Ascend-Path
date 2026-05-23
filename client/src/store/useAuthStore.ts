import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Basic User interface (can be expanded later)
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  respectPoints?: number;
  fameScore?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (userData, token) => {
        set({ user: userData, accessToken: token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      setAccessToken: (token) => {
        set({ accessToken: token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
      // Only persist the 'user' and 'isAuthenticated' state.
      // accessToken is intentionally excluded so it lives only in memory.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
