import { Expense, Subscription } from '@shared/types';
const MOCK_EXPENSES: Expense[] = [
  {
    id: 'e1',
    item: 'MacBook Pro M3',
    cost: 2499.00,
    date: '2023-10-15T10:00:00Z',
    assignedTo: 'Alice Freeman',
    category: 'infrastructure'
  },
  {
    id: 'e2',
    item: 'Office Chairs (x4)',
    cost: 1200.00,
    date: '2023-09-20T14:30:00Z',
    assignedTo: 'Office',
    category: 'office'
  },
  {
    id: 'e3',
    item: 'Dell UltraSharp Monitor',
    cost: 650.00,
    date: '2023-10-05T09:15:00Z',
    assignedTo: 'Bob Smith',
    category: 'infrastructure'
  },
  {
    id: 'e4',
    item: 'Team Lunch',
    cost: 185.50,
    date: '2023-10-27T12:00:00Z',
    assignedTo: 'All Team',
    category: 'other'
  }
];
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 's1',
    name: 'Adobe Creative Cloud',
    price: 54.99,
    billingCycle: 'monthly',
    nextBillingDate: '2023-11-01T00:00:00Z',
    status: 'active',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Creative_Cloud.svg/1200px-Creative_Cloud.svg.png'
  },
  {
    id: 's2',
    name: 'Figma Professional',
    price: 15.00,
    billingCycle: 'monthly',
    nextBillingDate: '2023-11-05T00:00:00Z',
    status: 'active',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
  },
  {
    id: 's3',
    name: 'Slack Business',
    price: 12.50,
    billingCycle: 'monthly',
    nextBillingDate: '2023-11-10T00:00:00Z',
    status: 'active',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg'
  },
  {
    id: 's4',
    name: 'Vercel Pro',
    price: 20.00,
    billingCycle: 'monthly',
    nextBillingDate: '2023-11-15T00:00:00Z',
    status: 'active',
    icon: 'https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png'
  },
  {
    id: 's5',
    name: 'Midjourney',
    price: 30.00,
    billingCycle: 'monthly',
    nextBillingDate: '2023-11-20T00:00:00Z',
    status: 'canceled',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Midjourney_Emblem.png'
  }
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const expenseService = {
  getExpenses: async (): Promise<Expense[]> => {
    await delay(600);
    return [...MOCK_EXPENSES];
  },
  getSubscriptions: async (): Promise<Subscription[]> => {
    await delay(500);
    return [...MOCK_SUBSCRIPTIONS];
  },
  addExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    await delay(400);
    const newExpense = { ...expense, id: `e${Date.now()}` };
    MOCK_EXPENSES.unshift(newExpense);
    return newExpense;
  }
};