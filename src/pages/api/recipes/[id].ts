import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import {
  getRecipeById,
  getRecipeWithDetails,
  updateRecipe,
  deleteRecipe,
  toggleRecipePublished,
} from '@/lib/db/queries/recipes';
import { updateRecipeSchema } from '@/lib/validations/recipe';

// GET /api/recipes/[id] - Get recipe by ID (with full details)
export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const withDetails = url.searchParams.get('details') !== 'false';

    const user = locals.user;
    const isAdmin = user?.role === 'admin';

    const db = getDb(locals.runtime);

    if (withDetails) {
      const recipe = await getRecipeWithDetails(db, id, !isAdmin);
      if (!recipe) {
        return new Response(JSON.stringify({ error: 'Receta no encontrada' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ recipe }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recipe = await getRecipeById(db, id);
    if (!recipe) {
      return new Response(JSON.stringify({ error: 'Receta no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if non-admin is trying to access unpublished recipe
    if (!isAdmin && !recipe.isPublished) {
      return new Response(JSON.stringify({ error: 'Receta no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ recipe }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener receta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/recipes/[id] - Update recipe (admin only)
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    // Check for toggle action
    if (body.action === 'toggle-published') {
      const db = getDb(locals.runtime);
      const recipe = await toggleRecipePublished(db, id);
      if (!recipe) {
        return new Response(JSON.stringify({ error: 'Receta no encontrada' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ recipe }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validationResult = updateRecipeSchema.safeParse(body);

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

    // Check if exists
    const existing = await getRecipeById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Receta no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recipe = await updateRecipe(db, id, validationResult.data);

    return new Response(JSON.stringify({ recipe }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar receta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/recipes/[id] - Delete recipe (admin only)
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);

    // Check if exists
    const existing = await getRecipeById(db, id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Receta no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteRecipe(db, id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar receta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
