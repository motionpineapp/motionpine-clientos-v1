import { Hono } from "hono";
import type { Env } from './core-utils';
import {
  ClientEntity,
  ProjectEntity,
  ExpenseEntity,
  SubscriptionEntity,
  TeamMemberEntity,
  PineTransactionEntity,
  ChatEntity,
  UserEntity,
  hashPassword
} from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- AUTH ---
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) return bad(c, 'Email and password required');
    // Ensure users are seeded
    await UserEntity.ensureSeed(c.env);
    // In a real app with many users, we'd use an index.
    // For this demo with < 10 users, listing all is fine.
    const { items } = await UserEntity.list(c.env);
    const user = items.find(u => u.email === email);
    if (!user) return c.json({ success: false, error: 'Invalid credentials' }, 401);
    const inputHash = await hashPassword(password);
    if (inputHash !== user.passwordHash) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    // Return user without password hash
    const { passwordHash, ...safeUser } = user;
    return ok(c, safeUser);
  });
  // --- CLIENTS ---
  app.get('/api/clients', async (c) => {
    await ClientEntity.ensureSeed(c.env);
    const { items } = await ClientEntity.list(c.env);
    return ok(c, items);
  });
  app.get('/api/clients/:id', async (c) => {
    const entity = new ClientEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c, 'Client not found');
    return ok(c, await entity.getState());
  });
  app.post('/api/clients', async (c) => {
    const body = await c.req.json();
    if (!body.name) return bad(c, 'Name required');
    const id = body.id || crypto.randomUUID();
    const entity = await ClientEntity.create(c.env, { ...body, id });
    return ok(c, entity);
  });
  app.put('/api/clients/:id', async (c) => {
    const body = await c.req.json();
    const entity = new ClientEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    await entity.patch(body);
    return ok(c, await entity.getState());
  });
  app.delete('/api/clients/:id', async (c) => {
    const deleted = await ClientEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // --- PROJECTS ---
  app.get('/api/projects', async (c) => {
    await ProjectEntity.ensureSeed(c.env);
    const { items } = await ProjectEntity.list(c.env);
    return ok(c, items);
  });
  app.get('/api/projects/:id', async (c) => {
    const entity = new ProjectEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    return ok(c, await entity.getState());
  });
  app.post('/api/projects', async (c) => {
    const body = await c.req.json();
    if (!body.title) return bad(c, 'Title required');
    const id = body.id || crypto.randomUUID();
    const entity = await ProjectEntity.create(c.env, { ...body, id });
    return ok(c, entity);
  });
  app.put('/api/projects/:id', async (c) => {
    const body = await c.req.json();
    const entity = new ProjectEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    await entity.patch(body);
    return ok(c, await entity.getState());
  });
  // Specific: Get projects for a client
  app.get('/api/clients/:id/projects', async (c) => {
    await ProjectEntity.ensureSeed(c.env);
    const clientId = c.req.param('id');
    const { items } = await ProjectEntity.list(c.env);
    const clientProjects = items.filter(p => p.clientId === clientId);
    return ok(c, clientProjects);
  });
  // --- EXPENSES ---
  app.get('/api/expenses', async (c) => {
    await ExpenseEntity.ensureSeed(c.env);
    const { items } = await ExpenseEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/expenses', async (c) => {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const entity = await ExpenseEntity.create(c.env, { ...body, id });
    return ok(c, entity);
  });
  // --- SUBSCRIPTIONS ---
  app.get('/api/subscriptions', async (c) => {
    await SubscriptionEntity.ensureSeed(c.env);
    const { items } = await SubscriptionEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/subscriptions', async (c) => {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const entity = await SubscriptionEntity.create(c.env, { ...body, id });
    return ok(c, entity);
  });
  // --- TEAMS ---
  app.get('/api/teams', async (c) => {
    await TeamMemberEntity.ensureSeed(c.env);
    const { items } = await TeamMemberEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/teams', async (c) => {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const entity = await TeamMemberEntity.create(c.env, { ...body, id });
    return ok(c, entity);
  });
  // --- PINES (Credits) ---
  app.get('/api/pines', async (c) => {
    await PineTransactionEntity.ensureSeed(c.env);
    const { items } = await PineTransactionEntity.list(c.env);
    const clientId = c.req.query('clientId');
    if (clientId) {
      return ok(c, items.filter(t => t.clientId === clientId));
    }
    return ok(c, items);
  });
  // --- CHATS ---
  app.get('/api/chats', async (c) => {
    await ChatEntity.ensureSeed(c.env);
    const { items } = await ChatEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/chats', async (c) => {
    const body = await c.req.json();
    if (!body.title) return bad(c, 'Title required');
    const id = body.id || crypto.randomUUID();
    const entity = await ChatEntity.create(c.env, { ...body, id, messages: [] });
    return ok(c, entity);
  });
  app.get('/api/chats/:id/messages', async (c) => {
    const entity = new ChatEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    return ok(c, await entity.listMessages());
  });
  app.post('/api/chats/:id/messages', async (c) => {
    const { userId, text } = await c.req.json();
    if (!userId || !text) return bad(c, 'Missing fields');
    const entity = new ChatEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    return ok(c, await entity.sendMessage(userId, text));
  });
}