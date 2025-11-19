import { Client, ClientStatus } from '@shared/types';
import { api } from '@/lib/api-client';
export const clientService = {
  getClients: async (): Promise<Client[]> => {
    return api<Client[]>('/api/clients');
  },
  getClient: async (id: string): Promise<Client | undefined> => {
    try {
      return await api<Client>(`/api/clients/${id}`);
    } catch (e) {
      return undefined;
    }
  },
  createClient: async (data: Omit<Client, 'id' | 'joinedAt' | 'totalProjects' | 'totalRevenue'>): Promise<Client> => {
    const newClient = {
      ...data,
      joinedAt: new Date().toISOString(),
      totalProjects: 0,
      totalRevenue: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
    };
    return api<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(newClient)
    });
  },
  updateClient: async (id: string, data: Partial<Client>): Promise<Client> => {
    return api<Client>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  updateClientStatus: async (id: string, status: ClientStatus): Promise<Client | undefined> => {
    return api<Client>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};