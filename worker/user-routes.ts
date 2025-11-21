import { Hono } from "hono";
import {
  UserEntity,
  ClientEntity,
  ProjectEntity,
  ChatEntity,
  ChatMessageEntity,
  ExpenseEntity,
  SubscriptionEntity,
  TeamMemberEntity,
  PineTransactionEntity,
  UserAccount
} from './entities';
import { verifyPassword, hashPassword } from './auth-utils';
import { ok, bad, notFound, isStr, Env } from './core-utils';
import type { User, Client, Project, Chat, ChatMessage, Expense, Subscription, TeamMember, PineTransaction } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Middleware to ensure seed data exists
  app.use('/api/*', async (c, next) => {
    await UserEntity.ensureSeed(c.env);
    await next();
  });
  // --- AUTH ROUTES ---
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password)) {
      return bad(c, 'Email and password are required.');
    }
    const userInstance = new UserEntity(c.env, email.toLowerCase());
    if (!(await userInstance.exists())) {
      return notFound(c, 'Invalid credentials.');
    }
    const userAccount = await userInstance.getState();
    const isPasswordValid = await verifyPassword(password, userAccount.passwordHash);
    if (!isPasswordValid) {
      return bad(c, 'Invalid credentials.');
    }
    const { passwordHash, ...userData } = userAccount;
    return ok(c, userData as User);
  });
  // --- CLIENTS ---
  app.get('/api/clients', async (c) => {
    const clients = await ClientEntity.list(c.env);
    return ok(c, clients);
  });
  app.post('/api/clients', async (c) => {
    const clientData = await c.req.json<Omit<Client, 'id'>>();
    const newClient: Client = { id: uuidv4(), accountStatus: 'pending', ...clientData };
    await ClientEntity.create(c.env, newClient);
    return ok(c, newClient);
  });
  app.get('/api/clients/:id', async (c) => {
    const { id } = c.req.param();
    const client = new ClientEntity(c.env, id);
    if (!(await client.exists())) return notFound(c, 'Client not found');
    return ok(c, await client.getState());
  });
  app.put('/api/clients/:id', async (c) => {
    const { id } = c.req.param();
    const clientData = await c.req.json<Partial<Client>>();
    const client = new ClientEntity(c.env, id);
    if (!(await client.exists())) return notFound(c, 'Client not found');
    await client.patch(clientData);
    return ok(c, await client.getState());
  });
  app.delete('/api/clients/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await ClientEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Client not found');
    return ok(c, { id });
  });
  // --- MAGIC LINK FLOW ---
  app.post('/api/clients/:clientId/generate-magic-link', async (c) => {
    const { clientId } = c.req.param();
    const client = new ClientEntity(c.env, clientId);
    if (!(await client.exists())) return notFound(c, 'Client not found');
    const state = await client.getState();
    if (state.accountStatus !== 'pending' && state.accountStatus !== 'expired') {
      return bad(c, 'Client account is not in a state to generate a link.');
    }
    const token = await client.generateMagicToken();
    return ok(c, { magicPath: `/client/setup?token=${token}&clientId=${clientId}` });
  });
  app.get('/api/clients/:clientId/validate-magic-link', async (c) => {
    const { clientId } = c.req.param();
    const token = c.req.query('token');
    if (!token) return bad(c, 'Token is required.');
    const client = new ClientEntity(c.env, clientId);
    if (!(await client.exists())) return notFound(c, 'Client not found');
    const validation = await client.validateToken(token);
    if (!validation.valid) return notFound(c, validation.reason);
    const clientData = await client.getState();
    const { magicToken, tokenExpiry, tokenUsedAt, ...safeClientData } = clientData;
    return ok(c, safeClientData);
  });
  app.post('/api/clients/:clientId/complete-setup', async (c) => {
    const { clientId } = c.req.param();
    const { password, token } = await c.req.json<{ password: string, token: string }>();
    if (!isStr(password) || !isStr(token)) return bad(c, 'Password and token are required.');
    const client = new ClientEntity(c.env, clientId);
    if (!(await client.exists())) return notFound(c, 'Client not found');
    const validation = await client.validateToken(token);
    if (!validation.valid) return bad(c, validation.reason);
    const clientData = await client.getState();
    const passwordHash = await hashPassword(password);
    const newUserAccount: UserAccount = {
      id: uuidv4(),
      email: clientData.email,
      name: clientData.name,
      company: clientData.company,
      role: 'client',
      avatar: clientData.avatar,
      passwordHash,
    };
    await UserEntity.create(c.env, newUserAccount);
    await client.completeSetup();
    const { passwordHash: _, ...safeUserData } = newUserAccount;
    return ok(c, safeUserData as User);
  });
  // --- PROJECTS ---
  app.get('/api/projects', async (c) => {
    const projects = await ProjectEntity.list(c.env);
    return ok(c, projects);
  });
  app.get('/api/projects/client/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const { items } = await ProjectEntity.list(c.env);
    const clientProjects = items.filter(p => p.clientId === clientId);
    return ok(c, clientProjects);
  });
  app.post('/api/projects', async (c) => {
    const projectData = await c.req.json<Omit<Project, 'id'>>();
    const newProject: Project = { id: uuidv4(), ...projectData };
    await ProjectEntity.create(c.env, newProject);
    return ok(c, newProject);
  });
  app.get('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const project = new ProjectEntity(c.env, id);
    if (!(await project.exists())) return notFound(c, 'Project not found');
    return ok(c, await project.getState());
  });
  app.put('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const projectData = await c.req.json<Partial<Project>>();
    const project = new ProjectEntity(c.env, id);
    if (!(await project.exists())) return notFound(c, 'Project not found');
    await project.patch(projectData);
    return ok(c, await project.getState());
  });
  app.delete('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await ProjectEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Project not found');
    return ok(c, { id });
  });
  // --- CHAT ---
  app.get('/api/chats', async (c) => {
    const chats = await ChatEntity.list(c.env);
    return ok(c, chats);
  });
  app.post('/api/chats', async (c) => {
    const { clientId } = await c.req.json<{ clientId: string }>();
    if (!isStr(clientId)) {
      return bad(c, 'Client ID is required.');
    }
    // Look up client name from ClientEntity
    const clientInstance = new ClientEntity(c.env, clientId);
    if (!(await clientInstance.exists())) {
      // If client doesn't exist, try to find a user with that ID (for client-side self-chat creation)
      const userInstance = new UserEntity(c.env, clientId); // Assuming client ID can be user email
      if (!(await userInstance.exists())) {
        return notFound(c, 'Associated client or user not found.');
      }
      const user = await userInstance.getState();
      const newChat: Chat = {
        id: `chat-${clientId}`,
        clientId,
        title: user.name,
        lastMessage: 'Chat created.',
        lastMessageTs: Date.now(),
        unreadCount: 0,
      };
      await ChatEntity.create(c.env, newChat);
      return ok(c, newChat);
    }
    const client = await clientInstance.getState();
    const newChat: Chat = {
      id: `chat-${clientId}`,
      clientId,
      title: client.name,
      lastMessage: 'Chat created.',
      lastMessageTs: Date.now(),
      unreadCount: 0,
    };
    await ChatEntity.create(c.env, newChat);
    return ok(c, newChat);
  });
  app.get('/api/chats/client/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const chatInstance = new ChatEntity(c.env, `chat-${clientId}`);
    if (!(await chatInstance.exists())) {
      return notFound(c, 'Chat not found');
    }
    return ok(c, await chatInstance.getState());
  });
  app.get('/api/chats/:chatId/messages', async (c) => {
    const { chatId } = c.req.param();
    const { items } = await ChatMessageEntity.list(c.env);
    const messages = items.filter(m => m.chatId === chatId).sort((a, b) => a.ts - b.ts);
    return ok(c, messages);
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const { chatId } = c.req.param();
    const { text, userId } = await c.req.json<{ text: string; userId: string }>();
    const userInstance = new UserEntity(c.env, userId);
    if (!(await userInstance.exists())) {
      return notFound(c, 'Sending user not found');
    }
    const user = await userInstance.getState();
    const newMessage: ChatMessage = {
      id: uuidv4(),
      chatId,
      userId,
      text,
      ts: Date.now(),
      senderName: user.name,
      senderAvatar: user.avatar,
    };
    await ChatMessageEntity.create(c.env, newMessage);
    // Update chat last message
    const chatInstance = new ChatEntity(c.env, chatId);
    await chatInstance.patch({ lastMessage: text, lastMessageTs: newMessage.ts });
    return ok(c, newMessage);
  });
  // --- EXPENSES ---
  app.get('/api/expenses', async (c) => ok(c, await ExpenseEntity.list(c.env)));
  app.post('/api/expenses', async (c) => {
    const data = await c.req.json<Omit<Expense, 'id'>>();
    const newExpense: Expense = { id: uuidv4(), ...data };
    return ok(c, await ExpenseEntity.create(c.env, newExpense));
  });
  // --- SUBSCRIPTIONS ---
  app.get('/api/subscriptions', async (c) => ok(c, await SubscriptionEntity.list(c.env)));
  app.post('/api/subscriptions', async (c) => {
    const data = await c.req.json<Omit<Subscription, 'id'>>();
    const newSub: Subscription = { id: uuidv4(), ...data };
    return ok(c, await SubscriptionEntity.create(c.env, newSub));
  });
  // --- TEAM ---
  app.get('/api/team', async (c) => ok(c, await TeamMemberEntity.list(c.env)));
  app.post('/api/team', async (c) => {
    const data = await c.req.json<Omit<TeamMember, 'id'>>();
    const newMember: TeamMember = { id: uuidv4(), ...data };
    return ok(c, await TeamMemberEntity.create(c.env, newMember));
  });
  // --- PINES ---
  app.get('/api/pines/transactions/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const { items } = await PineTransactionEntity.list(c.env);
    const transactions = items.filter(tx => tx.clientId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return ok(c, transactions);
  });
  app.get('/api/pines/balance/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const { items } = await PineTransactionEntity.list(c.env);
    const balance = items
      .filter(tx => tx.clientId === clientId)
      .reduce((acc, tx) => acc + tx.amount, 0);
    return ok(c, balance);
  });
}