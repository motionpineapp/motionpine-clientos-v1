import { create } from 'zustand';
import { User as SharedUser } from '@shared/types';
import { MOCK_ADMIN_USER, MOCK_CLIENT_USER } from './mock-data';
export type UserRole = 'admin' | 'client';
export type User = SharedUser;
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => Promise<User>;
  logout: () => void;
  checkSession: () => Promise<void>;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (role: UserRole) => {
    set({ isLoading: true });
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = role === 'admin' ? MOCK_ADMIN_USER : MOCK_CLIENT_USER;
        localStorage.setItem('motionpine_user', JSON.stringify(user));
        set({
          isAuthenticated: true,
          user: user,
          isLoading: false
        });
        resolve(user);
      }, 500);
    });
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
        set({ user, isAuthenticated: true });
      } catch (e) {
        console.error('Failed to parse session', e);
        localStorage.removeItem('motionpine_user');
      }
    }
    set({ isLoading: false });
  }
}));