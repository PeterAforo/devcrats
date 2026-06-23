import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  estateId?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

interface AuthState {
  user: AuthUser | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; estateId?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  'admin@estateiq.com': { id: '1', email: 'admin@estateiq.com', firstName: 'Kofi', lastName: 'Mensah', role: 'super_admin', emailVerified: true, mfaEnabled: false },
  'manager@estateiq.com': { id: '2', email: 'manager@estateiq.com', firstName: 'Kwame', lastName: 'Boateng', role: 'estate_manager', estateId: 'estate-1', emailVerified: true, mfaEnabled: false },
  'landlord@estateiq.com': { id: '3', email: 'landlord@estateiq.com', firstName: 'Nana', lastName: 'Akufo-Mensah', role: 'landlord', estateId: 'estate-1', emailVerified: true, mfaEnabled: false },
  'tenant@estateiq.com': { id: '4', email: 'tenant@estateiq.com', firstName: 'Kwame', lastName: 'Asante', role: 'tenant', estateId: 'estate-1', emailVerified: true, mfaEnabled: false },
};
const DEMO_PASSWORD = 'P@ssw0rd!';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isDemoMode: false,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const res = await api.post<{ data: { user: AuthUser; accessToken: string; refreshToken: string } }>('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = res.data;
          api.setToken(accessToken);
          api.setRefreshToken(refreshToken);
          api.setDemoMode(false);
          set({ user, refreshToken, isAuthenticated: true, isLoading: false, isDemoMode: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true });

        try {
          const res = await api.post<{ data: { user: AuthUser; accessToken: string; refreshToken: string } }>('/auth/register', {
            ...data,
          });
          const { user, accessToken, refreshToken } = res.data;
          api.setToken(accessToken);
          api.setRefreshToken(refreshToken);
          api.setDemoMode(false);
          set({ user, refreshToken, isAuthenticated: true, isLoading: false, isDemoMode: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        if (!api.isDemoMode) {
          try {
            await api.post('/auth/logout', { refreshToken: api.getRefreshToken() });
          } catch {
            // ignore
          }
        }
        api.setToken(null);
        api.setRefreshToken(null);
        api.setDemoMode(false);
        set({ user: null, refreshToken: null, isAuthenticated: false, isLoading: false, isDemoMode: false });
      },

      refreshAuth: async () => {
        if (api.isDemoMode) {
          set({ isLoading: false });
          return;
        }
        try {
          const res = await api.post<{ data: { accessToken: string; refreshToken: string } }>('/auth/refresh', { refreshToken: api.getRefreshToken() });
          api.setToken(res.data.accessToken);
          if (res.data.refreshToken) {
            api.setRefreshToken(res.data.refreshToken);
            set({ refreshToken: res.data.refreshToken });
          }
          const profile = await api.get<{ data: AuthUser }>('/auth/me');
          set({ user: profile.data, isAuthenticated: true, isLoading: false, isDemoMode: false });
        } catch {
          // Refresh failed — clear tokens so we don't keep retrying
          api.setToken(null);
          api.setRefreshToken(null);
          set({ refreshToken: null, isLoading: false });
        }
      },
    }),
    {
      name: 'estateiq-auth',
      partialize: (state) => ({ user: state.user, refreshToken: state.refreshToken, isAuthenticated: state.isAuthenticated, isDemoMode: state.isDemoMode }),
      onRehydrateStorage: () => (state) => {
        if (state?.isDemoMode) {
          api.setDemoMode(true);
        }
        // Restore refresh token to API client from persisted state
        if (state?.refreshToken) {
          api.setRefreshToken(state.refreshToken);
        }
      },
    },
  ),
);
