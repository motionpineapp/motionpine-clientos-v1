import { Client } from '@shared/types';
import { MOCK_CLIENTS } from './mock-data';
let clients = [...MOCK_CLIENTS];
export const clientService = {
  getClients: async (): Promise<{ items: Client[] }> => {
    return Promise.resolve({ items: clients });
  },
  getClient: async (id: string): Promise<Client> => {
    const client = clients.find(c => c.id === id);
    if (client) {
      return Promise.resolve(client);
    }
    return Promise.reject(new Error('Client not found'));
  },
  createClient: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    const newClient: Client = {
      id: `c${clients.length + 1}`,
      ...clientData,
    };
    clients.push(newClient);
    return Promise.resolve(newClient);
  },
  updateClient: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    let updatedClient: Client | null = null;
    clients = clients.map(c => {
      if (c.id === id) {
        updatedClient = { ...c, ...clientData };
        return updatedClient;
      }
      return c;
    });
    if (updatedClient) {
      return Promise.resolve(updatedClient);
    }
    return Promise.reject(new Error('Client not found'));
  },
};