import { Hono } from "hono";
import type { Env } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // All application-specific routes have been removed as part of the reversion
  // to a mock-data-driven frontend. This file is kept for structural integrity.
}