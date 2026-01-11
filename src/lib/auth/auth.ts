import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { validateTurnstile } from './turnstile';
import { hashPassword, verifyPassword } from './password';
import { getDb } from '@/lib/db';
import { users, purchases } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Note: Edge runtime with D1 requires special handling
// This configuration uses JWT sessions for edge compatibility

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt', // Required for edge runtime
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    // Provider 1: Standard Login (email + password)
    Credentials({
      id: 'credentials-login',
      name: 'Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        turnstileToken: { label: 'Turnstile Token', type: 'text' },
      },
      async authorize(credentials, req) {
        // Validate Turnstile token
        const turnstileValidation = await validateTurnstile(
          credentials.turnstileToken as string
        );

        if (!turnstileValidation.success) {
          throw new Error(turnstileValidation.error || 'Bot detection failed');
        }

        // Get D1 database from request (edge runtime)
        // Note: This will need to be adapted based on your deployment setup
        const db = getDb((req as any).env?.DB);

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.password) {
          throw new Error('Please use the registration code from your purchase email');
        }

        // Verify password
        const isValidPassword = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'user' | 'admin',
        };
      },
    }),

    // Provider 2: Registration with Purchase Code (email + code + password)
    Credentials({
      id: 'credentials-register',
      name: 'Register',
      credentials: {
        email: { label: 'Email', type: 'email' },
        purchaseCode: { label: 'Purchase Code', type: 'text' },
        password: { label: 'Password', type: 'password' },
        turnstileToken: { label: 'Turnstile Token', type: 'text' },
      },
      async authorize(credentials, req) {
        // Validate Turnstile token
        const turnstileValidation = await validateTurnstile(
          credentials.turnstileToken as string
        );

        if (!turnstileValidation.success) {
          throw new Error(turnstileValidation.error || 'Bot detection failed');
        }

        const db = getDb((req as any).env?.DB);

        // Find purchase by code
        const purchase = await db.query.purchases.findFirst({
          where: eq(purchases.purchaseCode, credentials.purchaseCode as string),
        });

        if (!purchase) {
          throw new Error('Invalid purchase code');
        }

        // Validate email matches purchase email
        if (purchase.email !== credentials.email) {
          throw new Error('Email does not match purchase record');
        }

        // Check if code already used for registration
        if (purchase.usedForRegistration) {
          throw new Error('This purchase code has already been used to register an account');
        }

        // Check if user already exists
        let user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (user) {
          throw new Error('An account with this email already exists. Please login instead.');
        }

        // Hash password
        const hashedPassword = await hashPassword(credentials.password as string);

        // Create new user
        const [newUser] = await db.insert(users).values({
          email: credentials.email as string,
          password: hashedPassword,
          role: 'user',
        }).returning();

        // Mark purchase code as used for registration
        await db.update(purchases)
          .set({
            usedForRegistration: true,
            registrationUsedAt: new Date(),
            userId: newUser.id,
          })
          .where(eq(purchases.id, purchase.id));

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role as 'user' | 'admin',
        };
      },
    }),
  ],
});

export const runtime = 'edge';
