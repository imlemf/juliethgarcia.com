import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { users, accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// POST /api/auth/seed-admin - Create admin user (dev only)
export const POST: APIRoute = async ({ locals, request }) => {
  // Only allow in development
  if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'Only available in development' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists', user: existingUser }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash password using Better Auth's format (Scrypt)
    const { scrypt } = await import('@noble/hashes/scrypt');
    const { bytesToHex, randomBytes } = await import('@noble/hashes/utils');

    const salt = bytesToHex(randomBytes(16));
    const derivedKey = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: 64 });
    const hashedPassword = `${salt}:${bytesToHex(derivedKey)}`;

    const userId = createId();
    const now = new Date();

    // Create user
    await db.insert(users).values({
      id: userId,
      name: name || 'Admin',
      email,
      emailVerified: true,
      role: 'admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create account with credential provider
    await db.insert(accounts).values({
      id: createId(),
      userId,
      accountId: userId,
      providerId: 'credential',
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created',
        user: { id: userId, email, role: 'admin' },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    const message = error instanceof Error ? error.message : 'Error creating admin';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
