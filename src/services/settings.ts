import { create } from 'zustand';
import { api } from '@/lib/api-client';

export interface SystemSettings {
    company_name: string;
    logo_url: string | null;
    favicon_url: string | null;
    meta_title: string;
    meta_description: string;
}

interface SettingsState {
    settings: SystemSettings;
    isLoading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (data: Partial<SystemSettings>) => Promise<void>;
}

const DEFAULT_SETTINGS: SystemSettings = {
    company_name: 'MotionPine',
    logo_url: null,
    favicon_url: null,
    meta_title: 'MotionPine ClientOS',
    meta_description: 'Client Management System'
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: DEFAULT_SETTINGS,
    isLoading: true,
    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    set({ settings: data.data, isLoading: false });
                    return;
                }
            }
            // Fallback
            set({ settings: DEFAULT_SETTINGS, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            set({ settings: DEFAULT_SETTINGS, isLoading: false });
        }
    },
    updateSettings: async (data) => {
        set({ isLoading: true });
        try {
            const updated = await api<SystemSettings>('/api/settings', {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            set({ settings: updated, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    }
}));
