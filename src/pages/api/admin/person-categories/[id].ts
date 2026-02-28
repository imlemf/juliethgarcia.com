import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getPersonCategoryById,
  getPersonCategoryBySlug,
  updatePersonCategory,
  deletePersonCategory,
  togglePersonCategoryActive,
} from '@/lib/db/queries/person-categories';
import { updatePersonCategorySchema } from '@/lib/validations/person';

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
  const category = await getPersonCategoryById(db, id);

  if (!category) {
    return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), { status: 404 });
  }

  return new Response(JSON.stringify({ category }), {
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
      const category = await togglePersonCategoryActive(db, id);
      if (!category) {
        return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), { status: 404 });
      }
      return new Response(JSON.stringify({ category }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = updatePersonCategorySchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb(locals.runtime);

    // Check if category exists
    const existing = await getPersonCategoryById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), { status: 404 });
    }

    // Check if slug is taken by another category
    if (result.data.slug) {
      const slugTaken = await getPersonCategoryBySlug(db, result.data.slug);
      if (slugTaken && slugTaken.id !== id) {
        return new Response(
          JSON.stringify({ error: 'El slug ya está en uso' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const category = await updatePersonCategory(db, id, result.data);

    return new Response(JSON.stringify({ category }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating person category:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar categoría' }),
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

    const existing = await getPersonCategoryById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), { status: 404 });
    }

    await deletePersonCategory(db, id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting person category:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar categoría' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
