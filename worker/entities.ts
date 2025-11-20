import { IndexedEntity } from './core-utils';
import type {
  User,
  Client,
  Project,
  Chat,
  ChatMessage,
  Expense,
  Subscription,
  TeamMember,
  PineTransaction
} from '@shared/types';
// --- UTILS ---
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
// --- ENTITIES ---
// User Entity
interface UserWithPassword extends User {
  hashedPassword?: string;
}
export class UserEntity extends IndexedEntity<UserWithPassword> {
  static readonly entityName = 'user';
  static readonly indexName = 'users';
  static override keyOf(entity: UserWithPassword) {
    return entity.email!;
  }
  static readonly initialState: UserWithPassword = { id: '', name: '', email: '' };
  static readonly seedData: ReadonlyArray<UserWithPassword> = [
    {
      id: 'admin-1',
      name: 'Sarah Jenkins',
      email: 'admin@motionpine.com',
      role: 'admin',
      company: 'MotionPine Agency',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      hashedPassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // 'password'
    },
    {
      id: 'c1',
      name: 'Alice Freeman',
      email: 'client@motionpine.com',
      role: 'client',
      company: 'Acme Corp',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      hashedPassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // 'password'
    }
  ];
}
// Client Entity
export class ClientEntity extends IndexedEntity<Client> {
  static readonly entityName = 'client';
  static readonly indexName = 'clients';
  static readonly initialState: Client = { id: '', name: '', company: '', email: '', status: 'inactive', totalProjects: 0, totalRevenue: 0, joinedAt: '' };
  static readonly seedData: ReadonlyArray<Client> = [
    { id: 'c1', name: 'Alice Freeman', company: 'Acme Corp', email: 'alice@acme.com', status: 'active', totalProjects: 3, totalRevenue: 12500, joinedAt: '2023-01-15T00:00:00Z', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
    { id: 'c2', name: 'Bob Smith', company: 'TechStart Inc', email: 'bob@techstart.io', status: 'active', totalProjects: 1, totalRevenue: 4200, joinedAt: '2023-03-10T00:00:00Z', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  ];
}
// Project Entity
export class ProjectEntity extends IndexedEntity<Project> {
  static readonly entityName = 'project';
  static readonly indexName = 'projects';
  static readonly initialState: Project = { id: '', title: '', clientId: '', clientName: '', status: 'todo', createdAt: '' };
  static readonly seedData: ReadonlyArray<Project> = [
    { id: 'p1', title: 'Website Redesign', clientId: 'c1', clientName: 'Acme Corp', status: 'in-progress', dueDate: '2023-12-01T00:00:00Z', createdAt: '2023-10-15T00:00:00Z', priority: 'high', description: 'Complete overhaul of the corporate website with new branding.' },
    { id: 'p2', title: 'Q4 Marketing Campaign', clientId: 'c1', clientName: 'Acme Corp', status: 'todo', dueDate: '2023-11-20T00:00:00Z', createdAt: '2023-10-20T00:00:00Z', priority: 'medium', description: 'Social media assets and ad copy for Q4 push.' },
  ];
}
// Chat Entity
export class ChatEntity extends IndexedEntity<Chat> {
  static readonly entityName = 'chat';
  static readonly indexName = 'chats';
  static readonly initialState: Chat = { id: '', title: '' };
  static readonly seedData: ReadonlyArray<Chat> = [
    { id: 'chat-c1', title: 'Alice Freeman', clientId: 'c1', lastMessage: 'Thanks for the update!', lastMessageTs: Date.now() - 300000, unreadCount: 2 },
  ];
}
// Chat Message Entity
export class ChatMessageEntity extends IndexedEntity<ChatMessage> {
  static readonly entityName = 'chatMessage';
  static readonly indexName = 'chatMessages';
  static readonly initialState: ChatMessage = { id: '', chatId: '', userId: '', text: '', ts: 0 };
  static readonly seedData: ReadonlyArray<ChatMessage> = [
    { id: 'm1', chatId: 'chat-c1', userId: 'c1', text: 'Hi there, just checking on the project status.', ts: Date.now() - 3600000, senderName: 'Alice Freeman' },
    { id: 'm2', chatId: 'chat-c1', userId: 'admin-1', text: 'Hello Alice! We are making great progress. I will send over a preview shortly.', ts: Date.now() - 1800000, senderName: 'Sarah Jenkins' },
  ];
}
// Expense Entity
export class ExpenseEntity extends IndexedEntity<Expense> {
  static readonly entityName = 'expense';
  static readonly indexName = 'expenses';
  static readonly initialState: Expense = { id: '', item: '', cost: 0, date: '' };
  static readonly seedData: ReadonlyArray<Expense> = [
    { id: 'e1', item: 'MacBook Pro M3', cost: 2499, date: '2023-10-15T10:00:00Z', assignedTo: 'Sarah Jenkins', category: 'infrastructure' },
  ];
}
// Subscription Entity
export class SubscriptionEntity extends IndexedEntity<Subscription> {
  static readonly entityName = 'subscription';
  static readonly indexName = 'subscriptions';
  static readonly initialState: Subscription = { id: '', name: '', price: 0, billingCycle: 'monthly', nextBillingDate: '', status: 'active' };
  static readonly seedData: ReadonlyArray<Subscription> = [
    { id: 's1', name: 'Adobe Creative Cloud', price: 54.99, billingCycle: 'monthly', nextBillingDate: '2023-11-01T00:00:00Z', status: 'active' },
  ];
}
// Team Member Entity
export class TeamMemberEntity extends IndexedEntity<TeamMember> {
  static readonly entityName = 'teamMember';
  static readonly indexName = 'teamMembers';
  static readonly initialState: TeamMember = { id: '', name: '', role: '', email: '', status: 'inactive', joinedAt: '' };
  static readonly seedData: ReadonlyArray<TeamMember> = [
    { id: 't1', name: 'Sarah Jenkins', role: 'Senior Designer', email: 'sarah@motionpine.com', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', joinedAt: '2022-03-15T00:00:00Z' },
  ];
}
// Pine Transaction Entity
export class PineTransactionEntity extends IndexedEntity<PineTransaction> {
  static readonly entityName = 'pineTransaction';
  static readonly indexName = 'pineTransactions';
  static readonly initialState: PineTransaction = { id: '', clientId: '', type: 'usage', amount: 0, description: '', date: '' };
  static readonly seedData: ReadonlyArray<PineTransaction> = [
    { id: 'pt1', clientId: 'c1', type: 'purchase', amount: 5000, description: 'Initial Credit Purchase', date: '2023-10-01T10:00:00Z' },
    { id: 'pt2', clientId: 'c1', type: 'usage', amount: -250, description: 'Rush Request Fee', date: '2023-10-15T14:30:00Z' },
  ];
}