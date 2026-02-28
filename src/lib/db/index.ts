import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';

// Get database instance from D1 binding
// Works both locally (via platformProxy/Miniflare) and in production (Cloudflare Workers)
export function getDb(runtime: { env: { DB: D1Database } }) {
  return drizzle(runtime.env.DB, { schema });
}

// Export schema for use in other files
export * from '@/db/schema';

// For type compatibility
export type DbClient = ReturnType<typeof getDb>;
