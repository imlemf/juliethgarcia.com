import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getAllReferralCategories, createReferralCategory, canCreateCategory, getCategoryCount } from '@/lib/db/queries/referral-categories';
import { createReferralCategorySchema } from '@/lib/validations/referral';

// GET /api/referral-categories - List categories
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const onlyActive = url.searchParams.get('onlyActive') === 'true';

    const db = getDb(locals.runtime);
    const categories = await getAllReferralCategories(db, onlyActive);

    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching referral categories:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener categorías' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/referral-categories - Create category (admin only)
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
    const validationResult = createReferralCategorySchema.safeParse(body);

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

    // Check max categories limit
    const canCreate = await canCreateCategory(db);
    if (!canCreate) {
      const count = await getCategoryCount(db);
      return new Response(
        JSON.stringify({ error: `No se pueden crear más de 10 categorías. Actualmente tienes ${count}.` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const category = await createReferralCategory(db, validationResult.data);

    return new Response(JSON.stringify({ category }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating referral category:', error);
    const message = error instanceof Error ? error.message : 'Error al crear categoría';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
