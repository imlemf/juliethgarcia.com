import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getAllPeople,
  createPerson,
  getPersonBySlug,
} from '@/lib/db/queries/people';
import { createPersonSchema } from '@/lib/validations/person';

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const showDrafts = url.searchParams.get('showDrafts') === 'true';
  const db = getDb(locals.runtime);

  const people = await getAllPeople(db, !showDrafts);

  return new Response(JSON.stringify({ people }), {
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
    const result = createPersonSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb(locals.runtime);

    // Check if slug already exists
    const existing = await getPersonBySlug(db, result.data.slug, false);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'El slug ya está en uso' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const person = await createPerson(db, result.data);

    return new Response(JSON.stringify({ person }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating person:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear persona' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
