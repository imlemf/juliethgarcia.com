import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';

// This will be used with Cloudflare D1
// For local development, you'll need to use wrangler with --local flag

export function getDb(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}

// For edge runtime compatibility
export type DbClient = ReturnType<typeof getDb>;
