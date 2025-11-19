import { create } from 'zustand';
export type UserRole = 'admin' | 'client';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
}
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}
// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      // In a real app, you'd use a proper API client.
      // For this project, we use fetch directly.
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // The backend should return a meaningful error message
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const user: User = await response.json();

      // Persist to localStorage for session management
      localStorage.setItem('motionpine_user', JSON.stringify(user));

      set({
        isAuthenticated: true,
        user: user,
        isLoading: false
      });
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      // Re-throw the error so the UI component can handle it (e.g., show a toast)
      throw error;
    }
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