import { Request, Response, NextFunction } from 'express';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env.js';

// Create a singleton connection
const queryClient = postgres(env.DATABASE_URL);
const db = drizzle(queryClient);

export interface DatabaseRequest extends Request {
  db?: typeof db;
}

/**
 * Middleware to attach database connection to request
 */
export function attachDatabase(
  req: DatabaseRequest,
  res: Response,
  next: NextFunction
): void {
  req.db = db;
  next();
}
