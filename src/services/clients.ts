import { Client, ClientStatus } from '@shared/types';
// Mock Data
const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Alice Freeman',
    company: 'Acme Corp',
    email: 'alice@acme.com',
    status: 'active',
    totalProjects: 3,
    totalRevenue: 12500,
    joinedAt: '2023-01-15T00:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Dr, Tech City, CA'
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    company: 'TechStart Inc',
    email: 'bob@techstart.io',
    status: 'active',
    totalProjects: 1,
    totalRevenue: 4200,
    joinedAt: '2023-03-10T00:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    phone: '+1 (555) 987-6543',
    address: '456 Startup Blvd, San Francisco, CA'
  },
  {
    id: 'c3',
    name: 'Charlie Davis',
    company: 'Global Media',
    email: 'charlie@global.media',
    status: 'paused',
    totalProjects: 0,
    totalRevenue: 800,
    joinedAt: '2023-06-22T00:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    phone: '+1 (555) 456-7890',
    address: '789 Media Ave, New York, NY'
  },
  {
    id: 'c4',
    name: 'Diana Prince',
    company: 'Wonder Design',
    email: 'diana@wonder.design',
    status: 'inactive',
    totalProjects: 5,
    totalRevenue: 25000,
    joinedAt: '2022-11-05T00:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    phone: '+1 (555) 222-3333',
    address: '101 Hero Lane, Metropolis, IL'
  },
  {
    id: 'c5',
    name: 'Evan Wright',
    company: 'Wright Architecture',
    email: 'evan@wright.arch',
    status: 'active',
    totalProjects: 2,
    totalRevenue: 15000,
    joinedAt: '2023-08-14T00:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan',
    phone: '+1 (555) 777-8888',
    address: '202 Design St, Chicago, IL'
  }
];
// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const clientService = {
  getClients: async (): Promise<Client[]> => {
    await delay(600);
    return [...MOCK_CLIENTS];
  },
  getClient: async (id: string): Promise<Client | undefined> => {
    await delay(400);
    return MOCK_CLIENTS.find(c => c.id === id);
  },
  createClient: async (data: Omit<Client, 'id' | 'joinedAt' | 'totalProjects' | 'totalRevenue'>): Promise<Client> => {
    await delay(800);
    const newClient: Client = {
      ...data,
      id: `c${Date.now()}`,
      joinedAt: new Date().toISOString(),
      totalProjects: 0,
      totalRevenue: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
    };
    MOCK_CLIENTS.push(newClient);
    return newClient;
  },
  updateClientStatus: async (id: string, status: ClientStatus): Promise<Client | undefined> => {
    await delay(500);
    const client = MOCK_CLIENTS.find(c => c.id === id);
    if (client) {
      client.status = status;
    }
    return client;
  }
};