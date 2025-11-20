import { Client } from '@shared/types';
import { api } from '@/lib/api-client';
export const clientService = {
  getClients: async (): Promise<{ items: Client[] }> => {
    return api('/api/clients');
  },
  getClient: async (id: string): Promise<Client> => {
    return api(`/api/clients/${id}`);
  },
  createClient: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    return api('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },
  updateClient: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    return api(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },
};