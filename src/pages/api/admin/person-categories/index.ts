import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getAllPersonCategories,
  createPersonCategory,
  getPersonCategoryBySlug,
} from '@/lib/db/queries/person-categories';
import { createPersonCategorySchema } from '@/lib/validations/person';

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const showInactive = url.searchParams.get('showInactive') === 'true';
  const db = getDb(locals.runtime);

  const categories = await getAllPersonCategories(db, !showInactive);

  return new Response(JSON.stringify({ categories }), {
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
    const result = createPersonCategorySchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb(locals.runtime);

    // Check if slug already exists
    const existing = await getPersonCategoryBySlug(db, result.data.slug);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'El slug ya está en uso' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const category = await createPersonCategory(db, result.data);

    return new Response(JSON.stringify({ category }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating person category:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear categoría' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
