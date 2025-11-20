import { Hono } from "hono";
import { UserEntity } from './entities';
import { verifyPassword } from './auth-utils';
import { ok, bad, notFound, isStr, Env } from './core-utils';
import type { User } from '@shared/types';
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
    const userInstance = new UserEntity(c.env, email);
    if (!(await userInstance.exists())) {
      return notFound(c, 'Invalid credentials.');
    }
    const userAccount = await userInstance.getState();
    const isPasswordValid = await verifyPassword(password, userAccount.passwordHash);
    if (!isPasswordValid) {
      return bad(c, 'Invalid credentials.');
    }
    // Return user data without the password hash
    const { passwordHash, ...userData } = userAccount;
    return ok(c, userData as User);
  });
}