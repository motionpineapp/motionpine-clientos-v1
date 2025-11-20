import { Hono } from "hono";
import type { Env } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // All API routes have been removed as the frontend is now using mock services.
  // This file is kept for structural consistency.
}