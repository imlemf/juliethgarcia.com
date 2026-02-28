import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { users, purchases } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createUserSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean().default(true),
});

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const roleFilter = url.searchParams.get('role');
  const emailFilter = url.searchParams.get('email');

  const db = getDb(locals.runtime);

  const conditions = [];
  if (roleFilter && (roleFilter === 'user' || roleFilter === 'admin')) {
    conditions.push(eq(users.role, roleFilter));
  }
  if (emailFilter) {
    conditions.push(like(users.email, `%${emailFilter}%`));
  }

  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    premiumUntil: users.premiumUntil,
    createdAt: users.createdAt,
    registrationPurchaseId: purchases.id,
  })
    .from(users)
    .leftJoin(purchases, and(
      eq(purchases.userId, users.id),
      eq(purchases.usedForRegistration, true)
    ))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return new Response(JSON.stringify({ users: allUsers }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, password, role, isActive } = result.data;
    const db = getDb(locals.runtime);

    // Check if email already exists
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: 'El email ya está registrado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isActive,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    });

    return new Response(JSON.stringify({ user: newUser }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear usuario' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
