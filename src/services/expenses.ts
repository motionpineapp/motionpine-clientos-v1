import { Expense, Subscription } from '@shared/types';
import { api } from '@/lib/api-client';
export const expenseService = {
  getExpenses: async (): Promise<Expense[]> => {
    return api<Expense[]>('/api/expenses');
  },
  getSubscriptions: async (): Promise<Subscription[]> => {
    return api<Subscription[]>('/api/subscriptions');
  },
  addExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    return api<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense)
    });
  },
  addSubscription: async (subscription: Omit<Subscription, 'id'>): Promise<Subscription> => {
    return api<Subscription>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription)
    });
  }
};