import { PineTransaction, ServiceType, PinePackage } from '@shared/types';
import { api } from '@/lib/api-client';

export const pineService = {
  // Balance and transactions
  getBalance: async (clientId: string): Promise<number> => {
    return api<number>(`/api/pines/balance/${clientId}`);
  },
  getTransactions: async (clientId: string): Promise<PineTransaction[]> => {
    return api<PineTransaction[]>(`/api/pines/transactions/${clientId}`);
  },

  // Service types
  getServiceTypes: async (): Promise<ServiceType[]> => {
    return api<ServiceType[]>('/api/services');
  },

  // Pine packages
  getPackages: async (): Promise<PinePackage[]> => {
    return api<PinePackage[]>('/api/pine-packages');
  },

  // Stripe checkout
  createCheckout: async (packageId: string, clientId: string, clientEmail?: string): Promise<{ checkoutUrl: string; sessionId: string }> => {
    return api<{ checkoutUrl: string; sessionId: string }>('/api/pines/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId, clientId, clientEmail }),
    });
  },

  // Batch project creation
  createProjects: async (
    clientId: string,
    projects: Array<{
      serviceTypeId: string;
      title: string;
      brief?: string;
      referenceLinks?: string;
    }>
  ): Promise<{
    projects: Array<{
      id: string;
      title: string;
      serviceTypeId: string;
      serviceName: string;
      pinesCharged: number;
    }>;
    totalPinesDeducted: number;
    newBalance: number;
  }> => {
    return api('/api/projects/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, projects }),
    });
  },
};