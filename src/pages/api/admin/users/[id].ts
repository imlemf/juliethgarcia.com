import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean(),
  premiumUntil: z.string().datetime().nullable().optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  const db = getDb(locals.runtime);

  const [foundUser] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    premiumUntil: users.premiumUntil,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, id)).limit(1);

  if (!foundUser) {
    return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
  }

  return new Response(JSON.stringify({ user: foundUser }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, password, role, isActive, premiumUntil } = result.data;
    const db = getDb(locals.runtime);

    // Check if user exists
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }

    // Check if email is taken by another user
    const [emailTaken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (emailTaken && emailTaken.id !== id) {
      return new Response(
        JSON.stringify({ error: 'El email ya está en uso por otro usuario' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      name,
      email: email.toLowerCase(),
      role,
      isActive,
      updatedAt: new Date(),
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Handle premium subscription date
    if (premiumUntil !== undefined) {
      updateData.premiumUntil = premiumUntil ? new Date(premiumUntil) : null;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        premiumUntil: users.premiumUntil,
      });

    return new Response(JSON.stringify({ user: updatedUser }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar usuario' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
