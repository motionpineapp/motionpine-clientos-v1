import { PineTransaction } from '@shared/types';
import { api } from '@/lib/api-client';
export const pineService = {
  getTransactions: async (clientId: string): Promise<PineTransaction[]> => {
    return api<PineTransaction[]>(`/api/pines?clientId=${clientId}`);
  },
  getBalance: async (clientId: string): Promise<number> => {
    const transactions = await api<PineTransaction[]>(`/api/pines?clientId=${clientId}`);
    return transactions.reduce((acc, curr) => acc + curr.amount, 0);
  }
};