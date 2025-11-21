import { Client, User } from '@shared/types';
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
  generateMagicLink: async (clientId: string): Promise<{ magicPath: string }> => {
    return api<{ magicPath: string }>(`/api/clients/${clientId}/generate-magic-link`, {
      method: 'POST',
    });
  },
  validateMagicLink: async (clientId: string, token: string): Promise<Client | null> => {
    try {
      return await api<Client>(`/api/clients/${clientId}/validate-magic-link?token=${token}`);
    } catch (error: any) {
      // Gracefully handle 404s for invalid/expired links
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.warn('Magic link validation failed (invalid or expired):', { clientId, token: token.substring(0, 8) + '...' });
        return null;
      }
      // Re-throw other errors
      console.error("Magic link validation failed with an unexpected error", error);
      throw error;
    }
  },
  completeSetup: async (clientId: string, token: string, password: string): Promise<User> => {
    return api<User>(`/api/clients/${clientId}/complete-setup`, {
      method: 'POST',
      body: JSON.stringify({ password, token }),
    });
  },
};