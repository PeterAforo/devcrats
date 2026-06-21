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
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
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
      isAuthenticated: false,
      isLoading: false,
      isDemoMode: false,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

      login: async (email, password) => {
        set({ isLoading: true });

        // If already in demo mode (no API configured in production), skip API call
        if (api.isDemoMode) {
          const account = DEMO_ACCOUNTS[email.toLowerCase()];
          if (!account || password !== DEMO_PASSWORD) {
            set({ isLoading: false });
            throw new Error('Invalid email or password');
          }
          api.setToken(null);
          set({ user: account, isAuthenticated: true, isLoading: false, isDemoMode: true });
          return;
        }

        try {
          const res = await api.post<{ data: { user: AuthUser; accessToken: string } }>('/auth/login', { email, password });
          const { user, accessToken } = res.data;
          api.setToken(accessToken);
          api.setDemoMode(false);
          set({ user, isAuthenticated: true, isLoading: false, isDemoMode: false });
        } catch {
          // Fallback to demo mode if API unavailable
          const account = DEMO_ACCOUNTS[email.toLowerCase()];
          if (!account || password !== DEMO_PASSWORD) {
            set({ isLoading: false });
            throw new Error('Invalid email or password');
          }
          api.setToken(null);
          api.setDemoMode(true);
          set({ user: account, isAuthenticated: true, isLoading: false, isDemoMode: true });
        }
      },

      register: async (data) => {
        set({ isLoading: true });

        // If already in demo mode, skip API call
        if (api.isDemoMode) {
          const newUser: AuthUser = {
            id: Date.now().toString(),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'tenant',
            emailVerified: false,
            mfaEnabled: false,
          };
          set({ user: newUser, isAuthenticated: true, isLoading: false, isDemoMode: true });
          return;
        }

        try {
          const res = await api.post<{ data: { user: AuthUser; accessToken: string } }>('/auth/register', {
            ...data,
          });
          const { user, accessToken } = res.data;
          api.setToken(accessToken);
          api.setDemoMode(false);
          set({ user, isAuthenticated: true, isLoading: false, isDemoMode: false });
        } catch {
          // Demo fallback
          const newUser: AuthUser = {
            id: Date.now().toString(),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'tenant',
            emailVerified: false,
            mfaEnabled: false,
          };
          api.setDemoMode(true);
          set({ user: newUser, isAuthenticated: true, isLoading: false, isDemoMode: true });
        }
      },

      logout: async () => {
        if (!api.isDemoMode) {
          try {
            await api.post('/auth/logout');
          } catch {
            // ignore
          }
        }
        api.setToken(null);
        api.setDemoMode(false);
        set({ user: null, isAuthenticated: false, isLoading: false, isDemoMode: false });
      },

      refreshAuth: async () => {
        if (api.isDemoMode) {
          set({ isLoading: false });
          return;
        }
        try {
          const res = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
          api.setToken(res.data.accessToken);
          const profile = await api.get<{ data: AuthUser }>('/auth/me');
          set({ user: profile.data, isAuthenticated: true, isLoading: false, isDemoMode: false });
        } catch {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'estateiq-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, isDemoMode: state.isDemoMode }),
      onRehydrateStorage: () => (state) => {
        if (state?.isDemoMode) {
          api.setDemoMode(true);
        }
      },
    },
  ),
);
