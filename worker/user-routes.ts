import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, isStr } from './core-utils';
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
  hashPassword
} from './entities';
import { User } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data on first request
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      UserEntity.ensureSeed(c.env),
      ClientEntity.ensureSeed(c.env),
      ProjectEntity.ensureSeed(c.env),
      ChatEntity.ensureSeed(c.env),
      ChatMessageEntity.ensureSeed(c.env),
      ExpenseEntity.ensureSeed(c.env),
      SubscriptionEntity.ensureSeed(c.env),
      TeamMemberEntity.ensureSeed(c.env),
      PineTransactionEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // --- AUTH ---
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password)) return bad(c, 'Email and password required');
    const userInst = new UserEntity(c.env, email);
    if (!(await userInst.exists())) return c.json({ success: false, error: 'Invalid credentials' }, 401);
    const user = await userInst.getState();
    const hashedProvidedPassword = await hashPassword(password);
    if (user.hashedPassword !== hashedProvidedPassword) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    const { hashedPassword, ...userToReturn } = user;
    return ok(c, userToReturn as User);
  });
  app.get('/api/auth/session', (c) => {
    // Placeholder for session validation (e.g., with JWT)
    return notFound(c, 'No active session');
  });
  // --- CLIENTS ---
  app.get('/api/clients', async (c) => ok(c, await ClientEntity.list(c.env)));
  app.get('/api/clients/:id', async (c) => {
    const { id } = c.req.param();
    const client = await new ClientEntity(c.env, id).getState();
    return client ? ok(c, client) : notFound(c);
  });
  app.post('/api/clients', async (c) => {
    const clientData = await c.req.json();
    clientData.id = crypto.randomUUID();
    return ok(c, await ClientEntity.create(c.env, clientData));
  });
  // --- PROJECTS ---
  app.get('/api/projects', async (c) => ok(c, await ProjectEntity.list(c.env)));
  app.get('/api/clients/:clientId/projects', async (c) => {
    const { clientId } = c.req.param();
    const allProjects = (await ProjectEntity.list(c.env)).items;
    return ok(c, allProjects.filter(p => p.clientId === clientId));
  });
  app.post('/api/projects', async (c) => {
    const projectData = await c.req.json();
    projectData.id = crypto.randomUUID();
    return ok(c, await ProjectEntity.create(c.env, projectData));
  });
  // --- CHAT ---
  app.get('/api/chats', async (c) => ok(c, await ChatEntity.list(c.env)));
  app.get('/api/chats/client/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const allChats = (await ChatEntity.list(c.env)).items;
    const chat = allChats.find(ch => ch.clientId === clientId);
    return chat ? ok(c, chat) : notFound(c);
  });
  app.get('/api/chats/:id/messages', async (c) => {
    const { id } = c.req.param();
    const allMessages = (await ChatMessageEntity.list(c.env)).items;
    return ok(c, allMessages.filter(m => m.chatId === id));
  });
  app.post('/api/chats/:id/messages', async (c) => {
    const { id: chatId } = c.req.param();
    const msgData = await c.req.json();
    msgData.id = crypto.randomUUID();
    msgData.chatId = chatId;
    msgData.ts = Date.now();
    return ok(c, await ChatMessageEntity.create(c.env, msgData));
  });
  // --- EXPENSES ---
  app.get('/api/expenses', async (c) => ok(c, await ExpenseEntity.list(c.env)));
  app.post('/api/expenses', async (c) => {
    const data = await c.req.json();
    data.id = crypto.randomUUID();
    return ok(c, await ExpenseEntity.create(c.env, data));
  });
  // --- SUBSCRIPTIONS ---
  app.get('/api/subscriptions', async (c) => ok(c, await SubscriptionEntity.list(c.env)));
  app.post('/api/subscriptions', async (c) => {
    const data = await c.req.json();
    data.id = crypto.randomUUID();
    return ok(c, await SubscriptionEntity.create(c.env, data));
  });
  // --- TEAM ---
  app.get('/api/team', async (c) => ok(c, await TeamMemberEntity.list(c.env)));
  app.post('/api/team', async (c) => {
    const data = await c.req.json();
    data.id = crypto.randomUUID();
    return ok(c, await TeamMemberEntity.create(c.env, data));
  });
  // --- PINES ---
  app.get('/api/pines/balance/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const txs = (await PineTransactionEntity.list(c.env)).items.filter(t => t.clientId === clientId);
    const balance = txs.reduce((acc, tx) => acc + tx.amount, 0);
    return ok(c, balance);
  });
  app.get('/api/pines/transactions/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const txs = (await PineTransactionEntity.list(c.env)).items.filter(t => t.clientId === clientId);
    return ok(c, txs);
  });
}