/**
 * Database Layer for MotionPine ClientOS
 * This file contains all SQL queries and database operations
 * Uses SQL column aliases to map snake_case to camelCase for TypeScript compatibility
 */

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

// Internal type that includes password_hash
export interface UserAccount extends User {
  password_hash: string;
}

// ============================================================================
// USERS
// ============================================================================

export async function getUserByEmail(db: D1Database, email: string): Promise<UserAccount | null> {
  const result = await db.prepare(
    'SELECT * FROM users WHERE email = ? LIMIT 1'
  ).bind(email.toLowerCase()).first<UserAccount>();

  return result || null;
}

export async function getUserById(db: D1Database, id: string): Promise<UserAccount | null> {
  const result = await db.prepare(
    'SELECT * FROM users WHERE id = ? LIMIT 1'
  ).bind(id).first<UserAccount>();

  return result || null;
}

export async function countUsers(db: D1Database): Promise<number> {
  const result = await db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
  return result?.count || 0;
}

// ... (updateUser remains here)

// ============================================================================
// CLIENTS
// ============================================================================

export async function listClients(db: D1Database): Promise<Client[]> {
  // ... (listClients implementation)
  const result = await db.prepare(`
    SELECT 
      id,
      name,
      company,
      email,
      status,
      account_status as accountStatus,
      total_projects as totalProjects,
      total_revenue as totalRevenue,
      joined_at as joinedAt,
      avatar,
      magic_token as magicToken,
      token_expiry as tokenExpiry,
      token_used_at as tokenUsedAt
    FROM clients 
    ORDER BY created_at DESC
  `).all<Client>();

  return result.results || [];
}

export async function getClientById(db: D1Database, id: string): Promise<Client | null> {
  const result = await db.prepare(`
    SELECT 
      id,
      name,
      company,
      email,
      status,
      account_status as accountStatus,
      total_projects as totalProjects,
      total_revenue as totalRevenue,
      joined_at as joinedAt,
      avatar,
      magic_token as magicToken,
      token_expiry as tokenExpiry,
      token_used_at as tokenUsedAt
    FROM clients 
    WHERE id = ? 
    LIMIT 1
  `).bind(id).first<Client>();

  return result || null;
}

export async function getClientByEmail(db: D1Database, email: string): Promise<Client | null> {
  const result = await db.prepare(`
    SELECT 
      id,
      name,
      company,
      email,
      status,
      account_status as accountStatus,
      total_projects as totalProjects,
      total_revenue as totalRevenue,
      joined_at as joinedAt,
      avatar,
      magic_token as magicToken,
      token_expiry as tokenExpiry,
      token_used_at as tokenUsedAt
    FROM clients 
    WHERE email = ? 
    LIMIT 1
  `).bind(email).first<Client>();

  return result || null;
}

export async function createClient(db: D1Database, client: Client): Promise<Client> {
  await db.prepare(`
    INSERT INTO clients (id, name, company, email, status, account_status, total_projects, total_revenue, joined_at, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    client.id,
    client.name,
    client.company,
    client.email,
    client.status,
    client.accountStatus,
    client.totalProjects || 0,
    client.totalRevenue || 0,
    client.joinedAt,
    client.avatar || null
  ).run();

  return client;
}

export async function updateClient(db: D1Database, id: string, data: Partial<Client>): Promise<Client> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.company !== undefined) { updates.push('company = ?'); values.push(data.company); }
  if (data.email !== undefined) { updates.push('email = ?'); values.push(data.email); }
  if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
  if (data.accountStatus !== undefined) { updates.push('account_status = ?'); values.push(data.accountStatus); }
  if (data.totalProjects !== undefined) { updates.push('total_projects = ?'); values.push(data.totalProjects); }
  if (data.totalRevenue !== undefined) { updates.push('total_revenue = ?'); values.push(data.totalRevenue); }
  if (data.avatar !== undefined) { updates.push('avatar = ?'); values.push(data.avatar); }
  if (data.magicToken !== undefined) { updates.push('magic_token = ?'); values.push(data.magicToken); }
  if (data.tokenExpiry !== undefined) { updates.push('token_expiry = ?'); values.push(data.tokenExpiry); }
  if (data.tokenUsedAt !== undefined) { updates.push('token_used_at = ?'); values.push(data.tokenUsedAt); }

  updates.push('updated_at = unixepoch()');
  values.push(id);

  await db.prepare(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  const updated = await getClientById(db, id);
  if (!updated) throw new Error('Client not found after update');
  return updated;
}

export async function deleteClient(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM clients WHERE id = ?').bind(id).run();
  return (result.meta.changes || 0) > 0;
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function listProjects(db: D1Database): Promise<Project[]> {
  const result = await db.prepare(`
    SELECT 
      id,
      title,
      client_id as clientId,
      client_name as clientName,
      status,
      created_at as createdAt
    FROM projects 
    ORDER BY created_at DESC
  `).all<Project>();

  return result.results || [];
}

export async function getProjectsByClientId(db: D1Database, clientId: string): Promise<Project[]> {
  const result = await db.prepare(`
    SELECT 
      id,
      title,
      client_id as clientId,
      client_name as clientName,
      status,
      created_at as createdAt
    FROM projects 
    WHERE client_id = ? 
    ORDER BY created_at DESC
  `).bind(clientId).all<Project>();

  return result.results || [];
}

export async function getProjectById(db: D1Database, id: string): Promise<Project | null> {
  const result = await db.prepare(`
    SELECT 
      id,
      title,
      client_id as clientId,
      client_name as clientName,
      status,
      created_at as createdAt
    FROM projects 
    WHERE id = ? 
    LIMIT 1
  `).bind(id).first<Project>();

  return result || null;
}

export async function createProject(db: D1Database, project: Project): Promise<Project> {
  await db.prepare(`
    INSERT INTO projects (id, title, client_id, client_name, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    project.id,
    project.title,
    project.clientId,
    project.clientName,
    project.status,
    project.createdAt
  ).run();

  return project;
}

export async function updateProject(db: D1Database, id: string, data: Partial<Project>): Promise<Project> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
  if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
  if (data.clientId !== undefined) { updates.push('client_id = ?'); values.push(data.clientId); }
  if (data.clientName !== undefined) { updates.push('client_name = ?'); values.push(data.clientName); }

  updates.push('updated_at = unixepoch()');
  values.push(id);

  await db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  const updated = await getProjectById(db, id);
  if (!updated) throw new Error('Project not found after update');
  return updated;
}

export async function deleteProject(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  return (result.meta.changes || 0) > 0;
}

// ============================================================================
// CHATS
// ============================================================================

export async function listChats(db: D1Database): Promise<Chat[]> {
  const result = await db.prepare(`
    SELECT 
      id,
      client_id as clientId,
      title,
      last_message as lastMessage,
      last_message_ts as lastMessageTs,
      unread_count as unreadCount
    FROM chats 
    ORDER BY last_message_ts DESC
  `).all<Chat>();

  return result.results || [];
}

export async function getChatByClientId(db: D1Database, clientId: string): Promise<Chat | null> {
  const result = await db.prepare(`
    SELECT 
      id,
      client_id as clientId,
      title,
      last_message as lastMessage,
      last_message_ts as lastMessageTs,
      unread_count as unreadCount
    FROM chats 
    WHERE client_id = ? 
    LIMIT 1
  `).bind(clientId).first<Chat>();

  return result || null;
}

export async function createChat(db: D1Database, chat: Chat): Promise<Chat> {
  await db.prepare(`
    INSERT INTO chats (id, client_id, title, last_message, last_message_ts, unread_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    chat.id,
    chat.clientId,
    chat.title,
    chat.lastMessage || null,
    chat.lastMessageTs || null,
    chat.unreadCount || 0
  ).run();

  return chat;
}

export async function updateChat(db: D1Database, id: string, data: Partial<Chat>): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.lastMessage !== undefined) { updates.push('last_message = ?'); values.push(data.lastMessage); }
  if (data.lastMessageTs !== undefined) { updates.push('last_message_ts = ?'); values.push(data.lastMessageTs); }
  if (data.unreadCount !== undefined) { updates.push('unread_count = ?'); values.push(data.unreadCount); }

  updates.push('updated_at = unixepoch()');
  values.push(id);

  await db.prepare(`UPDATE chats SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
}

// ============================================================================
// CHAT MESSAGES
// ============================================================================

export async function getChatMessages(db: D1Database, chatId: string): Promise<ChatMessage[]> {
  const result = await db.prepare(`
    SELECT 
      id,
      chat_id as chatId,
      user_id as userId,
      text,
      ts,
      sender_name as senderName,
      sender_avatar as senderAvatar,
      nonce
    FROM chat_messages 
    WHERE chat_id = ? 
    ORDER BY ts ASC
  `).bind(chatId).all<ChatMessage>();

  return result.results || [];
}

export async function createChatMessage(db: D1Database, message: ChatMessage): Promise<ChatMessage> {
  await db.prepare(`
    INSERT INTO chat_messages (id, chat_id, user_id, text, ts, sender_name, sender_avatar, nonce)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    message.id,
    message.chatId,
    message.userId,
    message.text,
    message.ts,
    message.senderName || null,
    message.senderAvatar || null,
    message.nonce || null
  ).run();

  return message;
}

// ============================================================================
// EXPENSES
// ============================================================================

export async function listExpenses(db: D1Database): Promise<Expense[]> {
  const result = await db.prepare(`
    SELECT 
      id,
      item,
      cost,
      date,
      assigned_to as assignedTo
    FROM expenses 
    ORDER BY date DESC
  `).all<Expense>();

  return result.results || [];
}

export async function createExpense(db: D1Database, expense: Expense): Promise<Expense> {
  await db.prepare(`
    INSERT INTO expenses (id, item, cost, date, assigned_to)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    expense.id,
    expense.item,
    expense.cost,
    expense.date,
    expense.assignedTo || null
  ).run();

  return expense;
}

export async function updateExpense(db: D1Database, id: string, data: Partial<Expense>): Promise<Expense> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.item !== undefined) { updates.push('item = ?'); values.push(data.item); }
  if (data.cost !== undefined) { updates.push('cost = ?'); values.push(data.cost); }
  if (data.date !== undefined) { updates.push('date = ?'); values.push(data.date); }
  if (data.assignedTo !== undefined) { updates.push('assigned_to = ?'); values.push(data.assignedTo); }

  updates.push('updated_at = unixepoch()');
  values.push(id);

  await db.prepare(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  const result = await db.prepare(`
    SELECT 
      id,
      item,
      cost,
      date,
      assigned_to as assignedTo
    FROM expenses 
    WHERE id = ? 
    LIMIT 1
  `).bind(id).first<Expense>();

  if (!result) throw new Error('Expense not found after update');
  return result;
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export async function listSubscriptions(db: D1Database): Promise<Subscription[]> {
  const result = await db.prepare(`
    SELECT 
      id,
      name,
      price,
      billing_cycle as billingCycle,
      next_billing_date as nextBillingDate,
      status
    FROM subscriptions 
    ORDER BY created_at DESC
  `).all<Subscription>();

  return result.results || [];
}

export async function createSubscription(db: D1Database, subscription: Subscription): Promise<Subscription> {
  await db.prepare(`
    INSERT INTO subscriptions (id, name, price, billing_cycle, next_billing_date, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    subscription.id,
    subscription.name,
    subscription.price,
    subscription.billingCycle,
    subscription.nextBillingDate,
    subscription.status
  ).run();

  return subscription;
}

// ============================================================================
// TEAM MEMBERS
// ============================================================================

export async function listTeamMembers(db: D1Database): Promise<TeamMember[]> {
  const result = await db.prepare(`
    SELECT 
      id,
      name,
      role,
      email,
      status,
      joined_at as joinedAt,
      avatar
    FROM team_members 
    ORDER BY created_at DESC
  `).all<TeamMember>();

  return result.results || [];
}

export async function createTeamMember(db: D1Database, member: TeamMember): Promise<TeamMember> {
  await db.prepare(`
    INSERT INTO team_members (id, name, role, email, status, joined_at, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    member.id,
    member.name,
    member.role,
    member.email,
    member.status,
    member.joinedAt,
    member.avatar || null
  ).run();

  return member;
}

// ============================================================================
// PINE TRANSACTIONS
// ============================================================================

export async function getTransactionsByClientId(db: D1Database, clientId: string): Promise<PineTransaction[]> {
  const result = await db.prepare(`
    SELECT 
      id,
      client_id as clientId,
      type,
      amount,
      description,
      date
    FROM pine_transactions 
    WHERE client_id = ? 
    ORDER BY date DESC
  `).bind(clientId).all<PineTransaction>();

  return result.results || [];
}

export async function getClientBalance(db: D1Database, clientId: string): Promise<number> {
  const result = await db.prepare(
    'SELECT SUM(amount) as balance FROM pine_transactions WHERE client_id = ?'
  ).bind(clientId).first<{ balance: number | null }>();

  return result?.balance || 0;
}
