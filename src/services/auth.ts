import { create } from 'zustand';
import { User as SharedUser } from '@shared/types';
import { api } from '@/lib/api-client';
export type User = SharedUser;
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  checkSession: () => Promise<void>;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await api<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('motionpine_user', JSON.stringify(user));
      set({
        isAuthenticated: true,
        user: user,
        isLoading: false
      });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('motionpine_user');
    set({ user: null, isAuthenticated: false });
  },
  checkSession: async () => {
    set({ isLoading: true });
    try {
      // Guard for non-browser environments (SSR)
      if (typeof window === 'undefined' || !window.localStorage) {
        set({ user: null, isAuthenticated: false });
        return;
      }

      const stored = localStorage.getItem('motionpine_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          set({ user, isAuthenticated: true });
        } catch (e) {
          console.error('Failed to parse session', e);
          try {
            localStorage.removeItem('motionpine_user');
          } catch (removeErr) {
            // swallow localStorage removal errors
            console.error('Failed to remove invalid session from localStorage', removeErr);
          }
          set({ user: null, isAuthenticated: false });
        }
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (e) {
      // Swallow and log any unexpected errors to ensure this function never throws
      console.error('checkSession error', e);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  }
}));