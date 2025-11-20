import { Client, ClientStatus } from '@shared/types';
import { MOCK_CLIENTS } from './mock-data';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const clientService = {
  getClients: async (): Promise<Client[]> => {
    await delay(300);
    return Promise.resolve(MOCK_CLIENTS);
  },
  getClient: async (id: string): Promise<Client | undefined> => {
    await delay(300);
    const client = MOCK_CLIENTS.find(c => c.id === id);
    return Promise.resolve(client);
  },
};