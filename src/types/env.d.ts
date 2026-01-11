// Cloudflare environment bindings types
import type {} from '@cloudflare/workers-types';

declare module '@cloudflare/next-on-pages' {
  interface CloudflareEnv {
    DB: D1Database;
    R2_BUCKET?: R2Bucket;
  }
}

