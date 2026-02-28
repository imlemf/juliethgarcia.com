import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from '@/lib/db';
import * as schema from '@/db/schema';
import bcrypt from 'bcryptjs';

// Create auth instance with D1 runtime binding
export function createAuth(runtime: { env: { DB: D1Database; AUTH_SECRET?: string } }) {
  return betterAuth({
    secret: runtime.env.AUTH_SECRET,
    database: drizzleAdapter(getDb(runtime), {
      provider: 'sqlite',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verificationTokens,
      },
    }),
    user: {
      additionalFields: {
        role: {
          type: 'string',
          defaultValue: 'user',
          input: false,
        },
        premiumUntil: {
          type: 'date',
          defaultValue: null,
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      password: {
        hash: async (password) => {
          return bcrypt.hashSync(password, 10);
        },
        verify: async ({ hash, password }) => {
          return bcrypt.compareSync(password, hash);
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // Update session every day
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes of cache
      },
    },
    advanced: {
      cookiePrefix: 'auth',
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth extends { $Infer: { Session: { session: infer S } } } ? S : never;
export type User = Auth extends { $Infer: { Session: { user: infer U } } } ? U : never;
