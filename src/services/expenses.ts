import { Expense, Subscription } from '@shared/types';
import { MOCK_EXPENSES, MOCK_SUBSCRIPTIONS } from './mock-data';
export const expenseService = {
  getExpenses: async (): Promise<{ items: Expense[] }> => {
    return Promise.resolve({ items: MOCK_EXPENSES });
  },
  createExpense: async (data: Omit<Expense, 'id'>): Promise<Expense> => {
    const newExpense: Expense = { id: `e${MOCK_EXPENSES.length + 1}`, ...data };
    // In a real mock, you'd push this to an array
    return Promise.resolve(newExpense);
  },
  getSubscriptions: async (): Promise<{ items: Subscription[] }> => {
    return Promise.resolve({ items: MOCK_SUBSCRIPTIONS });
  },
  createSubscription: async (data: Omit<Subscription, 'id'>): Promise<Subscription> => {
    const newSub: Subscription = { id: `s${MOCK_SUBSCRIPTIONS.length + 1}`, ...data };
    // In a real mock, you'd push this to an array
    return Promise.resolve(newSub);
  },
};