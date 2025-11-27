import { Hono } from "hono";
import { verifyPassword, hashPassword } from './auth-utils';
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, Client, Project, Chat, ChatMessage, Expense, Subscription, TeamMember, PineTransaction } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
import * as db from './db';

// Extended Env type to include D1 binding
interface Env {
  DB: D1Database;
  GlobalDurableObject: DurableObjectNamespace;
}

export function userRoutes(app: Hono<{ Bindings: Env }>) {

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password)) {
      return bad(c, 'Email and password are required.');
    }

    const userAccount = await db.getUserByEmail(c.env.DB, email.toLowerCase());
    if (!userAccount) {
      return notFound(c, 'Invalid credentials.');
    }

    const isPasswordValid = await verifyPassword(password, userAccount.password_hash);
    if (!isPasswordValid) {
      return bad(c, 'Invalid credentials.');
    }

    const { password_hash, ...userData } = userAccount;
    return ok(c, userData as User);
  });

  // --- USERS ---
  app.put('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const userData = await c.req.json<Partial<User>>();

    try {
      // ID is actually the email (lowercase)
      const updatedUser = await db.updateUser(c.env.DB, id, userData);
      return ok(c, updatedUser);
    } catch (error) {
      return notFound(c, 'User not found');
    }
  });

  // --- CLIENTS ---
  app.get('/api/clients', async (c) => {
    const clients = await db.listClients(c.env.DB);
    return ok(c, { items: clients, next: null });
  });

  app.post('/api/clients', async (c) => {
    const clientData = await c.req.json<Omit<Client, 'id'>>();
    const newClient: Client = {
      id: uuidv4(),
      accountStatus: 'pending',
      ...clientData
    };
    await db.createClient(c.env.DB, newClient);
    return ok(c, newClient);
  });

  app.get('/api/clients/:id', async (c) => {
    const { id } = c.req.param();
    const client = await db.getClientById(c.env.DB, id);
    if (!client) return notFound(c, 'Client not found');
    return ok(c, client);
  });

  app.put('/api/clients/:id', async (c) => {
    const { id } = c.req.param();
    const clientData = await c.req.json<Partial<Client>>();
    try {
      const updated = await db.updateClient(c.env.DB, id, clientData);
      return ok(c, updated);
    } catch (error) {
      return notFound(c, 'Client not found');
    }
  });

  app.delete('/api/clients/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await db.deleteClient(c.env.DB, id);
    if (!deleted) return notFound(c, 'Client not found');
    return ok(c, { id });
  });

  // --- MAGIC LINK FLOW ---
  app.post('/api/clients/:clientId/generate-magic-link', async (c) => {
    const { clientId } = c.req.param();
    const client = await db.getClientById(c.env.DB, clientId);
    if (!client) return notFound(c, 'Client not found');

    if (client.accountStatus !== 'pending' && client.accountStatus !== 'expired') {
      return bad(c, 'Client account is not in a state to generate a link.');
    }

    const token = uuidv4();
    await db.updateClient(c.env.DB, clientId, {
      magicToken: token,
      tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      accountStatus: 'setup_initiated',
      tokenUsedAt: undefined,
    });

    return ok(c, { magicPath: `/client/setup?token=${token}&clientId=${clientId}` });
  });

  app.get('/api/clients/:clientId/validate-magic-link', async (c) => {
    const { clientId } = c.req.param();
    const token = c.req.query('token');
    if (!token) return bad(c, 'Token is required.');

    const client = await db.getClientById(c.env.DB, clientId);
    if (!client) return notFound(c, 'Client not found');

    // Validate token
    if (client.accountStatus !== 'setup_initiated') {
      return notFound(c, 'Invalid account state.');
    }
    if (client.magicToken !== token) {
      return notFound(c, 'Token mismatch.');
    }
    if (client.tokenUsedAt) {
      return notFound(c, 'Token has already been used.');
    }
    if (client.tokenExpiry && Date.now() > client.tokenExpiry) {
      await db.updateClient(c.env.DB, clientId, { accountStatus: 'expired' });
      return notFound(c, 'Token has expired.');
    }

    const { magicToken, tokenExpiry, tokenUsedAt, ...safeClientData } = client;
    return ok(c, safeClientData);
  });

  app.post('/api/clients/:clientId/complete-setup', async (c) => {
    const { clientId } = c.req.param();
    const { password, token } = await c.req.json<{ password: string, token: string }>();

    if (!isStr(password) || !isStr(token)) return bad(c, 'Password and token are required.');

    const client = await db.getClientById(c.env.DB, clientId);
    if (!client) return notFound(c, 'Client not found');

    // Validate token
    if (client.accountStatus !== 'setup_initiated') return bad(c, 'Invalid account state.');
    if (client.magicToken !== token) return bad(c, 'Token mismatch.');
    if (client.tokenUsedAt) return bad(c, 'Token has already been used.');
    if (client.tokenExpiry && Date.now() > client.tokenExpiry) return bad(c, 'Token has expired.');

    const passwordHash = await hashPassword(password);

    // Create user account in users table
    const newUserAccount: db.UserAccount = {
      id: uuidv4(),
      email: client.email,
      name: client.name,
      company: client.company,
      role: 'client',
      avatar: client.avatar,
      password_hash: passwordHash,
    };

    // Insert user (we need to do this manually since we have password_hash)
    await c.env.DB.prepare(`
      INSERT INTO users (email, id, name, role, company, avatar, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      newUserAccount.email.toLowerCase(),
      newUserAccount.id,
      newUserAccount.name,
      newUserAccount.role,
      newUserAccount.company || null,
      newUserAccount.avatar || null,
      newUserAccount.password_hash
    ).run();

    // Update client status
    await db.updateClient(c.env.DB, clientId, {
      accountStatus: 'active',
      tokenUsedAt: Date.now(),
      magicToken: undefined,
      tokenExpiry: undefined,
    });

    const { password_hash: _, ...safeUserData } = newUserAccount;
    return ok(c, safeUserData as User);
  });

  // --- PROJECTS ---
  app.get('/api/projects', async (c) => {
    const projects = await db.listProjects(c.env.DB);
    return ok(c, { items: projects, next: null });
  });

  app.get('/api/projects/client/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const clientProjects = await db.getProjectsByClientId(c.env.DB, clientId);
    return ok(c, clientProjects);
  });

  app.post('/api/projects', async (c) => {
    const projectData = await c.req.json<Omit<Project, 'id'>>();
    const newProject: Project = { id: uuidv4(), ...projectData };
    await db.createProject(c.env.DB, newProject);
    return ok(c, newProject);
  });

  app.get('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const project = await db.getProjectById(c.env.DB, id);
    if (!project) return notFound(c, 'Project not found');
    return ok(c, project);
  });

  app.put('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const projectData = await c.req.json<Partial<Project>>();
    try {
      const updated = await db.updateProject(c.env.DB, id, projectData);
      return ok(c, updated);
    } catch (error) {
      return notFound(c, 'Project not found');
    }
  });

  app.delete('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await db.deleteProject(c.env.DB, id);
    if (!deleted) return notFound(c, 'Project not found');
    return ok(c, { id });
  });

  // --- CHAT ---
  app.get('/api/chats', async (c) => {
    const chats = await db.listChats(c.env.DB);
    return ok(c, { items: chats, next: null });
  });

  app.post('/api/chats', async (c) => {
    const { clientId } = await c.req.json<{ clientId: string }>();
    if (!isStr(clientId)) {
      return bad(c, 'Client ID is required.');
    }

    // Look up client name
    const client = await db.getClientById(c.env.DB, clientId);
    let title = 'Chat';

    if (client) {
      title = client.name;
    } else {
      // Try to find user
      const user = await db.getUserByEmail(c.env.DB, clientId);
      if (user) {
        title = user.name;
      } else {
        return notFound(c, 'Associated client or user not found.');
      }
    }

    const newChat: Chat = {
      id: `chat-${clientId}`,
      clientId,
      title,
      lastMessage: 'Chat created.',
      lastMessageTs: Date.now(),
      unreadCount: 0,
    };

    await db.createChat(c.env.DB, newChat);
    return ok(c, newChat);
  });

  app.get('/api/chats/client/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const chat = await db.getChatByClientId(c.env.DB, clientId);
    if (!chat) {
      return notFound(c, 'Chat not found');
    }
    return ok(c, chat);
  });

  app.get('/api/chats/:chatId/messages', async (c) => {
    const { chatId } = c.req.param();
    const messages = await db.getChatMessages(c.env.DB, chatId);
    return ok(c, messages);
  });

  app.post('/api/chats/:chatId/messages', async (c) => {
    const { chatId } = c.req.param();
    const { text, userId } = await c.req.json<{ text: string; userId: string }>();

    const user = await db.getUserByEmail(c.env.DB, userId);
    if (!user) {
      return notFound(c, 'Sending user not found');
    }

    const newMessage: ChatMessage = {
      id: uuidv4(),
      chatId,
      userId,
      text,
      ts: Date.now(),
      senderName: user.name,
      senderAvatar: user.avatar,
    };

    await db.createChatMessage(c.env.DB, newMessage);

    // Update chat last message
    await db.updateChat(c.env.DB, chatId, {
      lastMessage: text,
      lastMessageTs: newMessage.ts
    });

    return ok(c, newMessage);
  });

  // --- EXPENSES ---
  app.get('/api/expenses', async (c) => {
    const expenses = await db.listExpenses(c.env.DB);
    return ok(c, { items: expenses, next: null });
  });

  app.post('/api/expenses', async (c) => {
    const data = await c.req.json<Omit<Expense, 'id'>>();
    const newExpense: Expense = { id: uuidv4(), ...data };
    await db.createExpense(c.env.DB, newExpense);
    return ok(c, newExpense);
  });

  app.put('/api/expenses/:id', async (c) => {
    const { id } = c.req.param();
    const data = await c.req.json<Partial<Expense>>();

    // Handle explicit null for unassignment
    const updateData = { ...data };
    if ('assignedTo' in data && data.assignedTo === null) {
      updateData.assignedTo = undefined;
    }

    try {
      const updated = await db.updateExpense(c.env.DB, id, updateData);
      return ok(c, updated);
    } catch (error) {
      return notFound(c, 'Expense not found');
    }
  });

  // --- SUBSCRIPTIONS ---
  app.get('/api/subscriptions', async (c) => {
    const subscriptions = await db.listSubscriptions(c.env.DB);
    return ok(c, { items: subscriptions, next: null });
  });

  app.post('/api/subscriptions', async (c) => {
    const data = await c.req.json<Omit<Subscription, 'id'>>();
    const newSub: Subscription = { id: uuidv4(), ...data };
    await db.createSubscription(c.env.DB, newSub);
    return ok(c, newSub);
  });

  // --- TEAM ---
  app.get('/api/team', async (c) => {
    const team = await db.listTeamMembers(c.env.DB);
    return ok(c, { items: team, next: null });
  });

  app.post('/api/team', async (c) => {
    const data = await c.req.json<Omit<TeamMember, 'id'>>();
    const newMember: TeamMember = { id: uuidv4(), ...data };
    await db.createTeamMember(c.env.DB, newMember);
    return ok(c, newMember);
  });

  // --- PINES ---
  app.get('/api/pines/transactions/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const transactions = await db.getTransactionsByClientId(c.env.DB, clientId);
    return ok(c, transactions);
  });

  app.get('/api/pines/balance/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const balance = await db.getClientBalance(c.env.DB, clientId);
    return ok(c, balance);
  });
}