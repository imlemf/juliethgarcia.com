import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getPersonById,
  getPersonBySlug,
  getPersonWithDetails,
  updatePerson,
  deletePerson,
  togglePersonPublished,
} from '@/lib/db/queries/people';
import { updatePersonSchema } from '@/lib/validations/person';
import { deleteFromImageKit } from '@/lib/imagekit';

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
  const person = await getPersonWithDetails(db, id);

  if (!person) {
    return new Response(JSON.stringify({ error: 'Persona no encontrada' }), { status: 404 });
  }

  return new Response(JSON.stringify({ person }), {
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
    const db = getDb(locals.runtime);

    // Handle toggle published shortcut
    if (body.togglePublished === true) {
      const person = await togglePersonPublished(db, id);
      if (!person) {
        return new Response(JSON.stringify({ error: 'Persona no encontrada' }), { status: 404 });
      }
      return new Response(JSON.stringify({ person }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = updatePersonSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if person exists
    const existing = await getPersonById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Persona no encontrada' }), { status: 404 });
    }

    // Check if slug is taken by another person
    if (result.data.slug) {
      const slugTaken = await getPersonBySlug(db, result.data.slug, false);
      if (slugTaken && slugTaken.id !== id) {
        return new Response(
          JSON.stringify({ error: 'El slug ya está en uso' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // If avatar is being changed and there was an old one, delete it from ImageKit
    if (
      result.data.avatarFileId !== undefined &&
      existing.avatarFileId &&
      result.data.avatarFileId !== existing.avatarFileId
    ) {
      try {
        await deleteFromImageKit(existing.avatarFileId, locals.runtime as any);
      } catch (error) {
        console.error('Error deleting old avatar from ImageKit:', error);
      }
    }

    const person = await updatePerson(db, id, result.data);

    return new Response(JSON.stringify({ person }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating person:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar persona' }),
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

    const existing = await getPersonById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Persona no encontrada' }), { status: 404 });
    }

    // Delete avatar from ImageKit if exists
    if (existing.avatarFileId) {
      try {
        await deleteFromImageKit(existing.avatarFileId, locals.runtime as any);
      } catch (error) {
        console.error('Error deleting avatar from ImageKit:', error);
      }
    }

    await deletePerson(db, id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting person:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar persona' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
