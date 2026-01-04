import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from src/config)
config({ path: path.resolve(__dirname, '../../../..', '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),

  // Database
  DATABASE_URL: z.string(),

  // Azure AD
  AZURE_TENANT_ID: z.string(),
  AZURE_CLIENT_ID: z.string(),
  AZURE_CLIENT_SECRET: z.string(),

  // Search (optional for now)
  MEILISEARCH_URL: z.string().url().optional(),
  MEILISEARCH_API_KEY: z.string().optional(),

  // App
  WEB_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32).optional().default('dev-secret-min-32-chars-long-please'),
});

export const env = envSchema.parse(process.env);
