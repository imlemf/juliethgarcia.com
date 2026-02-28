import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getPersonTitleById,
  getPersonTitleBySlug,
  updatePersonTitle,
  deletePersonTitle,
  togglePersonTitleActive,
} from '@/lib/db/queries/person-titles';
import { updatePersonTitleSchema } from '@/lib/validations/person';

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
  const title = await getPersonTitleById(db, id);

  if (!title) {
    return new Response(JSON.stringify({ error: 'Título no encontrado' }), { status: 404 });
  }

  return new Response(JSON.stringify({ title }), {
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

    // Handle toggle active shortcut
    if (body.toggleActive === true) {
      const db = getDb(locals.runtime);
      const title = await togglePersonTitleActive(db, id);
      if (!title) {
        return new Response(JSON.stringify({ error: 'Título no encontrado' }), { status: 404 });
      }
      return new Response(JSON.stringify({ title }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = updatePersonTitleSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb(locals.runtime);

    // Check if title exists
    const existing = await getPersonTitleById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Título no encontrado' }), { status: 404 });
    }

    // Check if slug is taken by another title
    if (result.data.slug) {
      const slugTaken = await getPersonTitleBySlug(db, result.data.slug);
      if (slugTaken && slugTaken.id !== id) {
        return new Response(
          JSON.stringify({ error: 'El slug ya está en uso' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const title = await updatePersonTitle(db, id, result.data);

    return new Response(JSON.stringify({ title }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating person title:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar título' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  try {
    const db = getDb(locals.runtime);

    const existing = await getPersonTitleById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Título no encontrado' }), { status: 404 });
    }

    await deletePersonTitle(db, id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting person title:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar título' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
