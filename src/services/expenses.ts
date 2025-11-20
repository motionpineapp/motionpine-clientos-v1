import { Expense, Subscription } from '@shared/types';
import { MOCK_EXPENSES, MOCK_SUBSCRIPTIONS } from './mock-data';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const expenseService = {
  getExpenses: async (): Promise<Expense[]> => {
    await delay(300);
    return Promise.resolve(MOCK_EXPENSES);
  },
  getSubscriptions: async (): Promise<Subscription[]> => {
    await delay(300);
    return Promise.resolve(MOCK_SUBSCRIPTIONS);
  },
};