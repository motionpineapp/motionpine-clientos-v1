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
// --- ENTITIES ---
// User Entity
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = 'user';
  static readonly indexName = 'users';
  static override keyOf(entity: Partial<User>) {
    return entity.email!;
  }
  static readonly initialState: User = { id: '', name: '', email: '' };
}
// Client Entity
export class ClientEntity extends IndexedEntity<Client> {
  static readonly entityName = 'client';
  static readonly indexName = 'clients';
  static readonly initialState: Client = { id: '', name: '', company: '', email: '', status: 'inactive', totalProjects: 0, totalRevenue: 0, joinedAt: '' };
}
// Project Entity
export class ProjectEntity extends IndexedEntity<Project> {
  static readonly entityName = 'project';
  static readonly indexName = 'projects';
  static readonly initialState: Project = { id: '', title: '', clientId: '', clientName: '', status: 'todo', createdAt: '' };
}
// Chat Entity
export class ChatEntity extends IndexedEntity<Chat> {
  static readonly entityName = 'chat';
  static readonly indexName = 'chats';
  static readonly initialState: Chat = { id: '', title: '' };
}
// Chat Message Entity
export class ChatMessageEntity extends IndexedEntity<ChatMessage> {
  static readonly entityName = 'chatMessage';
  static readonly indexName = 'chatMessages';
  static readonly initialState: ChatMessage = { id: '', chatId: '', userId: '', text: '', ts: 0 };
}
// Expense Entity
export class ExpenseEntity extends IndexedEntity<Expense> {
  static readonly entityName = 'expense';
  static readonly indexName = 'expenses';
  static readonly initialState: Expense = { id: '', item: '', cost: 0, date: '' };
}
// Subscription Entity
export class SubscriptionEntity extends IndexedEntity<Subscription> {
  static readonly entityName = 'subscription';
  static readonly indexName = 'subscriptions';
  static readonly initialState: Subscription = { id: '', name: '', price: 0, billingCycle: 'monthly', nextBillingDate: '', status: 'active' };
}
// Team Member Entity
export class TeamMemberEntity extends IndexedEntity<TeamMember> {
  static readonly entityName = 'teamMember';
  static readonly indexName = 'teamMembers';
  static readonly initialState: TeamMember = { id: '', name: '', role: '', email: '', status: 'inactive', joinedAt: '' };
}
// Pine Transaction Entity
export class PineTransactionEntity extends IndexedEntity<PineTransaction> {
  static readonly entityName = 'pineTransaction';
  static readonly indexName = 'pineTransactions';
  static readonly initialState: PineTransaction = { id: '', clientId: '', type: 'usage', amount: 0, description: '', date: '' };
}