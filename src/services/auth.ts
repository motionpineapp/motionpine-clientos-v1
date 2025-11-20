import { create } from 'zustand';
import { MOCK_ADMIN_USER, MOCK_CLIENT_USER } from './mock-data';
export type UserRole = 'admin' | 'client';
export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  company?: string;
}
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}
// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (role: UserRole) => {
    set({ isLoading: true });
    await delay(500); // Simulate network request
    const user = role === 'admin' ? MOCK_ADMIN_USER : MOCK_CLIENT_USER;
    localStorage.setItem('motionpine_user', JSON.stringify(user));
    set({
      isAuthenticated: true,
      user: user,
      isLoading: false
    });
  },
  logout: () => {
    localStorage.removeItem('motionpine_user');
    set({ user: null, isAuthenticated: false });
  },
  checkSession: async () => {
    set({ isLoading: true });
    // Simulate session check
    await delay(400);
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