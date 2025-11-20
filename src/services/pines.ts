import { PineTransaction } from '@shared/types';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// Mock data for Pines
const MOCK_PINES_BALANCE = 4750;
const MOCK_PINE_TRANSACTIONS: PineTransaction[] = [
    { id: 'pt1', clientId: 'c1', type: 'purchase', amount: 5000, description: 'Initial Credit Purchase', date: '2023-10-01T10:00:00Z' },
    { id: 'pt2', clientId: 'c1', type: 'usage', amount: -250, description: 'Rush Request Fee', date: '2023-10-15T14:30:00Z' }
];
export const pineService = {
  getBalance: async (clientId: string): Promise<number> => {
    await delay(200);
    // In a real app, you'd calculate this based on transactions.
    // For mock, just return a static value.
    // console.log is used to avoid unused variable warnings during linting.
    console.log(`Fetching balance for client: ${clientId}`);
    return Promise.resolve(MOCK_PINES_BALANCE);
  },
  getTransactions: async (clientId: string): Promise<PineTransaction[]> => {
    await delay(300);
    console.log(`Fetching transactions for client: ${clientId}`);
    return Promise.resolve(MOCK_PINE_TRANSACTIONS);
  },
};