import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getAllPersonTitles,
  createPersonTitle,
  getPersonTitleBySlug,
} from '@/lib/db/queries/person-titles';
import { createPersonTitleSchema } from '@/lib/validations/person';

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const showInactive = url.searchParams.get('showInactive') === 'true';
  const db = getDb(locals.runtime);

  const titles = await getAllPersonTitles(db, !showInactive);

  return new Response(JSON.stringify({ titles }), {
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
    const result = createPersonTitleSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb(locals.runtime);

    // Check if slug already exists
    const existing = await getPersonTitleBySlug(db, result.data.slug);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'El slug ya está en uso' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const title = await createPersonTitle(db, result.data);

    return new Response(JSON.stringify({ title }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating person title:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear título' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
