import { IndexedEntity, Index } from './core-utils';
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
  PineTransaction,
  AccountStatus
} from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export interface UserAccount extends User {
  passwordHash: string;
}
export class UserEntity extends IndexedEntity<UserAccount> {
  static readonly entityName = 'userAccount';
  static readonly indexName = 'userAccounts';
  static override keyOf(entity: Partial<UserAccount>) {
    return entity.email!.toLowerCase();
  }
  static readonly initialState: UserAccount = { id: '', name: '', email: '', passwordHash: '' };
  static async ensureSeed(env: any): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
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
      passwordHash
    },
    {
      id: 'admin-2',
      name: 'Mike Ross',
      email: 'admin2@motionpine.com',
      role: 'admin',
      company: 'MotionPine Agency',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      passwordHash
    },
    {
      id: 'client-1',
      name: 'Alice Freeman',
      email: 'client@motionpine.com',
      role: 'client',
      company: 'Acme Corp',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      passwordHash
    }];
    await Promise.all(seedUsers.map((s) => new this(env, this.keyOf(s)).save(s)));
    await idx.addBatch(seedUsers.map((s) => this.keyOf(s)));
    console.log('Initial users seeded.');
  }
}
export class ClientEntity extends IndexedEntity<Client> {
  static readonly entityName = 'client';
  static readonly indexName = 'clients';
  static readonly initialState: Client = { id: '', name: '', company: '', email: '', status: 'inactive', totalProjects: 0, totalRevenue: 0, joinedAt: '', accountStatus: 'pending' };
  async generateMagicToken(): Promise<string> {
    const token = uuidv4();
    await this.mutate(s => ({
      ...s,
      magicToken: token,
      tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      accountStatus: 'setup_initiated',
      tokenUsedAt: undefined,
    }));
    return token;
  }
  async validateToken(token: string): Promise<{ valid: boolean; reason: string }> {
    const state = await this.getState();
    if (state.accountStatus !== 'setup_initiated') return { valid: false, reason: 'Invalid account state.' };
    if (state.magicToken !== token) return { valid: false, reason: 'Token mismatch.' };
    if (state.tokenUsedAt) return { valid: false, reason: 'Token has already been used.' };
    if (state.tokenExpiry && Date.now() > state.tokenExpiry) {
      await this.mutate(s => ({ ...s, accountStatus: 'expired' }));
      return { valid: false, reason: 'Token has expired.' };
    }
    return { valid: true, reason: 'Token is valid.' };
  }
  async completeSetup(): Promise<void> {
    await this.mutate(s => ({
      ...s,
      accountStatus: 'active',
      tokenUsedAt: Date.now(),
      magicToken: undefined,
      tokenExpiry: undefined,
    }));
  }
}
export class ProjectEntity extends IndexedEntity<Project> {
  static readonly entityName = 'project';
  static readonly indexName = 'projects';
  static readonly initialState: Project = { id: '', title: '', clientId: '', clientName: '', status: 'todo', createdAt: '' };
}
export class ChatEntity extends IndexedEntity<Chat> {
  static readonly entityName = 'chat';
  static readonly indexName = 'chats';
  static readonly initialState: Chat = { id: '', title: '' };
}
export class ChatMessageEntity extends IndexedEntity<ChatMessage> {
  static readonly entityName = 'chatMessage';
  static readonly indexName = 'chatMessages';
  static readonly initialState: ChatMessage = { id: '', chatId: '', userId: '', text: '', ts: 0 };
}
export class ExpenseEntity extends IndexedEntity<Expense> {
  static readonly entityName = 'expense';
  static readonly indexName = 'expenses';
  static readonly initialState: Expense = { id: '', item: '', cost: 0, date: '' };
}
export class SubscriptionEntity extends IndexedEntity<Subscription> {
  static readonly entityName = 'subscription';
  static readonly indexName = 'subscriptions';
  static readonly initialState: Subscription = { id: '', name: '', price: 0, billingCycle: 'monthly', nextBillingDate: '', status: 'active' };
}
export class TeamMemberEntity extends IndexedEntity<TeamMember> {
  static readonly entityName = 'teamMember';
  static readonly indexName = 'teamMembers';
  static readonly initialState: TeamMember = { id: '', name: '', role: '', email: '', status: 'inactive', joinedAt: '' };
}
export class PineTransactionEntity extends IndexedEntity<PineTransaction> {
  static readonly entityName = 'pineTransaction';
  static readonly indexName = 'pineTransactions';
  static readonly initialState: PineTransaction = { id: '', clientId: '', type: 'usage', amount: 0, description: '', date: '' };
}