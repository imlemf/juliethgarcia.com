import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getPublicPersonBySlug } from '@/lib/db/queries/people';

// GET /api/people/[slug] - Get a single person by slug (public data only)
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { slug } = params;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);
    const person = await getPublicPersonBySlug(db, slug);

    if (!person) {
      return new Response(JSON.stringify({ error: 'Persona no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ person }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching person:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener persona' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
