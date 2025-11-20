import { PineTransaction } from '@shared/types';
import { api } from '@/lib/api-client';
export const pineService = {
  getBalance: async (clientId: string): Promise<number> => {
    return api(`/api/pines/balance/${clientId}`);
  },
  getTransactions: async (clientId: string): Promise<PineTransaction[]> => {
    return api(`/api/pines/transactions/${clientId}`);
  },
};