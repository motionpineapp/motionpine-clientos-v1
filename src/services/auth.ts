import { create } from 'zustand';
import { api } from '@/lib/api-client';
import { User as SharedUser } from '@shared/types';
export type UserRole = 'admin' | 'client';
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
  isLoading: true, // Start with loading true for session check
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
    const stored = localStorage.getItem('motionpine_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        // Optional: verify session with backend here
        set({ user, isAuthenticated: true });
      } catch (e) {
        console.error('Failed to parse session', e);
        localStorage.removeItem('motionpine_user');
      }
    }
    set({ isLoading: false });
  }
}));