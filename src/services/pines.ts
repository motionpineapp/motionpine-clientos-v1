import { PineTransaction } from '@shared/types';
import { MOCK_PINE_TRANSACTIONS } from './mock-data';
export const pineService = {
  getBalance: async (clientId: string): Promise<number> => {
    const balance = MOCK_PINE_TRANSACTIONS
      .filter(tx => tx.clientId === clientId)
      .reduce((acc, tx) => acc + tx.amount, 0);
    return Promise.resolve(balance);
  },
  getTransactions: async (clientId: string): Promise<PineTransaction[]> => {
    const transactions = MOCK_PINE_TRANSACTIONS.filter(tx => tx.clientId === clientId);
    return Promise.resolve(transactions);
  },
};