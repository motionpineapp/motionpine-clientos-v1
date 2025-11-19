import { Hono } from "hono";
import type { Env } from './core-utils';
import { 
  ClientEntity, 
  ProjectEntity, 
  ExpenseEntity, 
  SubscriptionEntity, 
  TeamMemberEntity, 
  PineTransactionEntity,
  ChatEntity
} from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
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
  // --- TEAMS ---
  app.get('/api/teams', async (c) => {
    await TeamMemberEntity.ensureSeed(c.env);
    const { items } = await TeamMemberEntity.list(c.env);
    return ok(c, items);
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