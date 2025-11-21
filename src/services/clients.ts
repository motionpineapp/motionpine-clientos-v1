import { Client, User, AccountStatus } from '@shared/types';
import { api } from '@/lib/api-client';
export const clientService = {
  getClients: async (): Promise<{ items: Client[] }> => {
    return api<{ items: Client[] }>('/api/clients');
  },
  createClient: async (clientData: Omit<Client, 'id' | 'joinedAt' | 'totalProjects' | 'totalRevenue'>): Promise<Client> => {
    return api<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },
  updateClient: async (clientId: string, clientData: Partial<Client>): Promise<Client> => {
    return api<Client>(`/api/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },
  generateMagicLink: async (clientId: string): Promise<{ magicUrl: string }> => {
    return api<{ magicUrl: string }>(`/api/clients/${clientId}/generate-magic-link`, {
      method: 'POST',
    });
  },
  validateMagicLink: async (clientId: string, token: string): Promise<Client | null> => {
    try {
      return await api<Client>(`/api/clients/${clientId}/validate-magic-link?token=${token}`);
    } catch (error) {
      console.error("Magic link validation failed", error);
      return null;
    }
  },
  completeSetup: async (clientId: string, token: string, password: string): Promise<User> => {
    return api<User>(`/api/clients/${clientId}/complete-setup`, {
      method: 'POST',
      body: JSON.stringify({ password, token }),
    });
  },
};