import {
  Client,
  Project,
  Expense,
  Subscription,
  TeamMember,
  Chat,
  ChatMessage,
  User,
  PineTransaction
} from '@shared/types';
export const MOCK_ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Sarah Jenkins',
  email: 'admin@motionpine.com',
  role: 'admin',
  company: 'MotionPine Agency',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
};
export const MOCK_CLIENT_USER: User = {
  id: 'c1',
  name: 'Alice Freeman',
  email: 'client@motionpine.com',
  role: 'client',
  company: 'Acme Corp',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
};
export const MOCK_CLIENTS: Client[] = [
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
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Website Redesign',
    clientId: 'c1',
    clientName: 'Acme Corp',
    status: 'in-progress',
    dueDate: '2023-12-01T00:00:00Z',
    createdAt: '2023-10-15T00:00:00Z',
    priority: 'high',
    description: 'Complete overhaul of the corporate website with new branding.'
  },
  {
    id: 'p2',
    title: 'Q4 Marketing Campaign',
    clientId: 'c1',
    clientName: 'Acme Corp',
    status: 'todo',
    dueDate: '2023-11-20T00:00:00Z',
    createdAt: '2023-10-20T00:00:00Z',
    priority: 'medium',
    description: 'Social media assets and ad copy for Q4 push.'
  },
  {
    id: 'p3',
    title: 'Mobile App MVP',
    clientId: 'c2',
    clientName: 'TechStart Inc',
    status: 'in-progress',
    dueDate: '2024-01-15T00:00:00Z',
    createdAt: '2023-09-01T00:00:00Z',
    priority: 'high',
    description: 'Initial release of the iOS and Android application.'
  },
  {
    id: 'p4',
    title: 'Brand Identity Refresh',
    clientId: 'c3',
    clientName: 'Global Media',
    status: 'done',
    dueDate: '2023-10-01T00:00:00Z',
    createdAt: '2023-08-15T00:00:00Z',
    priority: 'medium',
    description: 'Logo update and brand guidelines document.'
  },
  {
    id: 'p5',
    title: 'E-commerce Integration',
    clientId: 'c4',
    clientName: 'Wonder Design',
    status: 'done',
    dueDate: '2023-09-30T00:00:00Z',
    createdAt: '2023-07-10T00:00:00Z',
    priority: 'high',
    description: 'Shopify integration for the main product line.'
  },
  {
    id: 'p6',
    title: 'SEO Audit',
    clientId: 'c5',
    clientName: 'Wright Architecture',
    status: 'todo',
    dueDate: '2023-11-10T00:00:00Z',
    createdAt: '2023-10-25T00:00:00Z',
    priority: 'low',
    description: 'Technical SEO audit and content recommendations.'
  }
];
export const MOCK_EXPENSES: Expense[] = [
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
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
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
export const MOCK_TEAM: TeamMember[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'Senior Designer',
    email: 'sarah@motionpine.com',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    phone: '+1 (555) 111-2222',
    joinedAt: '2022-03-15T00:00:00Z'
  },
  {
    id: 't2',
    name: 'Mike Ross',
    role: 'Frontend Developer',
    email: 'mike@motionpine.com',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    phone: '+1 (555) 333-4444',
    joinedAt: '2022-06-01T00:00:00Z'
  },
  {
    id: 't3',
    name: 'Jessica Pearson',
    role: 'Project Manager',
    email: 'jessica@motionpine.com',
    status: 'on-leave',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    phone: '+1 (555) 555-6666',
    joinedAt: '2021-11-10T00:00:00Z'
  },
  {
    id: 't4',
    name: 'Harvey Specter',
    role: 'Creative Director',
    email: 'harvey@motionpine.com',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harvey',
    phone: '+1 (555) 777-8888',
    joinedAt: '2021-01-05T00:00:00Z'
  },
  {
    id: 't5',
    name: 'Louis Litt',
    role: 'Finance Manager',
    email: 'louis@motionpine.com',
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Louis',
    phone: '+1 (555) 999-0000',
    joinedAt: '2021-08-20T00:00:00Z'
  }
];
export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    title: 'Alice Freeman',
    clientId: 'c1',
    lastMessage: 'Thanks for the update!',
    lastMessageTs: Date.now() - 1000 * 60 * 5, // 5 mins ago
    unreadCount: 2
  },
  {
    id: 'chat-2',
    title: 'Bob Smith',
    clientId: 'c2',
    lastMessage: 'When is the next meeting?',
    lastMessageTs: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    unreadCount: 0
  },
  {
    id: 'chat-3',
    title: 'Charlie Davis',
    clientId: 'c3',
    lastMessage: 'Invoice received.',
    lastMessageTs: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    unreadCount: 0
  }
];
export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    chatId: 'chat-1',
    userId: 'c1',
    text: 'Hi there, just checking on the project status.',
    ts: Date.now() - 1000 * 60 * 60,
    senderName: 'Alice Freeman',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
  {
    id: 'm2',
    chatId: 'chat-1',
    userId: 'admin-1',
    text: 'Hello Alice! We are making great progress. I will send over a preview shortly.',
    ts: Date.now() - 1000 * 60 * 30,
    senderName: 'Admin User',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  },
  {
    id: 'm3',
    chatId: 'chat-1',
    userId: 'c1',
    text: 'Thanks for the update!',
    ts: Date.now() - 1000 * 60 * 5,
    senderName: 'Alice Freeman',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
  {
    id: 'm4',
    chatId: 'chat-2',
    userId: 'c2',
    text: 'When is the next meeting?',
    ts: Date.now() - 1000 * 60 * 60 * 2,
    senderName: 'Bob Smith',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
  }
];
export const MOCK_PINE_TRANSACTIONS: PineTransaction[] = [
  { id: 'pt1', clientId: 'c1', type: 'purchase', amount: 5000, description: 'Initial Credit Purchase', date: '2023-10-01T10:00:00Z' },
  { id: 'pt2', clientId: 'c1', type: 'usage', amount: -250, description: 'Rush Request Fee', date: '2023-10-15T14:30:00Z' },
  { id: 'pt3', clientId: 'c1', type: 'usage', amount: -1000, description: 'Website Redesign - Phase 1', date: '2023-10-20T18:00:00Z' },
  { id: 'pt4', clientId: 'c1', type: 'purchase', amount: 2500, description: 'Credit Top-up', date: '2023-10-25T11:00:00Z' },
];