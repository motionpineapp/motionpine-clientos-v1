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
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}
// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email: string, role: UserRole) => {
    set({ isLoading: true });
    await delay(800); // Simulate network request
    // CRITICAL: These IDs match the seed data in worker/entities.ts
    // t1 = Sarah Jenkins (Admin/Team)
    // c1 = Alice Freeman (Client)
    const mockUser: User = {
      id: role === 'admin' ? 't1' : 'c1',
      name: role === 'admin' ? 'Sarah Jenkins' : 'Alice Freeman',
      email: role === 'admin' ? 'sarah@motionpine.com' : 'alice@acme.com',
      role,
      company: role === 'client' ? 'Acme Corp' : 'MotionPine Agency',
      avatar: role === 'admin' 
        ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' 
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    };
    // Persist to localStorage for demo purposes
    localStorage.setItem('motionpine_user', JSON.stringify(mockUser));
    set({
      isAuthenticated: true,
      user: mockUser,
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