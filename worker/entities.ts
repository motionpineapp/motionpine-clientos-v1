import { IndexedEntity } from './core-utils';
import { hashPassword } from './auth-utils';
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
// Backend-only User Account type with password hash
export interface UserAccount extends User {
  passwordHash: string;
}
// User Entity
export class UserEntity extends IndexedEntity<UserAccount> {
  static readonly entityName = 'userAccount';
  static readonly indexName = 'userAccounts';
  static override keyOf(entity: Partial<UserAccount>) {
    return entity.email!;
  }
  static readonly initialState: UserAccount = { id: '', name: '', email: '', passwordHash: '' };
  static async ensureSeed(env: Env): Promise<void> {
    const idx = new IndexedEntity.Index<string>(env, this.indexName);
    const ids = await idx.list();
    if (ids.length > 0) return;
    console.log('Seeding initial users...');
    const passwordHash = await hashPassword('password');
    const seedUsers: UserAccount[] = [
      {
        id: 'admin-1',
        name: 'Sarah Jenkins',
        email: 'admin@motionpine.com',
        role: 'admin',
        company: 'MotionPine Agency',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        passwordHash,
      },
      {
        id: 'client-1',
        name: 'Alice Freeman',
        email: 'client@motionpine.com',
        role: 'client',
        company: 'Acme Corp',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        passwordHash,
      }
    ];
    await Promise.all(seedUsers.map(s => new this(env, this.keyOf(s)).save(s)));
    await idx.addBatch(seedUsers.map(s => this.keyOf(s)));
    console.log('Initial users seeded.');
  }
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