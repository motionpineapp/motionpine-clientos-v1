import { Expense, Subscription } from '@shared/types';
import { api } from '@/lib/api-client';
export const expenseService = {
  getExpenses: async (): Promise<{ items: Expense[] }> => {
    return api<{ items: Expense[] }>('/api/expenses');
  },
  createExpense: async (data: Omit<Expense, 'id'>): Promise<Expense> => {
    return api<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getSubscriptions: async (): Promise<{ items: Subscription[] }> => {
    return api<{ items: Subscription[] }>('/api/subscriptions');
  },
  createSubscription: async (data: Omit<Subscription, 'id'>): Promise<Subscription> => {
    return api<Subscription>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};