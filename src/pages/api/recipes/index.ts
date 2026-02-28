import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getAllRecipes, createRecipe } from '@/lib/db/queries/recipes';
import { createRecipeSchema } from '@/lib/validations/recipe';

// GET /api/recipes - List recipes
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const showDrafts = url.searchParams.get('showDrafts') === 'true';

    const user = locals.user;
    const isAdmin = user?.role === 'admin';

    // Only admins can see drafts
    const onlyPublished = !showDrafts || !isAdmin;

    const db = getDb(locals.runtime);
    const recipes = await getAllRecipes(db, onlyPublished);

    return new Response(JSON.stringify({ recipes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener recetas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/recipes - Create recipe (admin only)
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
    const validationResult = createRecipeSchema.safeParse(body);

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

    // Handle empty optional fields
    const data = {
      ...validationResult.data,
      imageUrl: validationResult.data.imageUrl || undefined,
      categoryId: validationResult.data.categoryId || undefined,
    };

    const recipe = await createRecipe(db, data);

    return new Response(JSON.stringify({ recipe }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return new Response(JSON.stringify({ error: 'Error al crear receta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
