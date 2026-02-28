import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/59c0831bcc6fec9e063094aa2e2d63a82bc9d59e299294314b2571273999ffcf.sqlite'
  }
} satisfies Config;
