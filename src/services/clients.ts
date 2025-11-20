import { Client } from '@shared/types';
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
};