import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getAllRecipeCategories,
  createRecipeCategory,
} from '@/lib/db/queries/recipe-categories';
import { createRecipeCategorySchema } from '@/lib/validations/recipe';

// GET /api/recipe-categories - List categories
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const showInactive = url.searchParams.get('showInactive') === 'true';

    const user = locals.user;
    const isAdmin = user?.role === 'admin';

    // Only admins can see inactive categories
    const onlyActive = !showInactive || !isAdmin;

    const db = getDb(locals.runtime);
    const categories = await getAllRecipeCategories(db, onlyActive);

    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching recipe categories:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener categorías' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST /api/recipe-categories - Create category (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validationResult = createRecipeCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Datos inválidos',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const db = getDb(locals.runtime);
    const category = await createRecipeCategory(db, validationResult.data);

    return new Response(JSON.stringify({ category }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating recipe category:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear categoría' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
