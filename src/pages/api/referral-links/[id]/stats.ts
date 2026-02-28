import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getReferralLinkById, getClickStats } from '@/lib/db/queries/referral-links';

// GET /api/referral-links/[id]/stats - Get link analytics (admin only)
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    const user = locals.user;

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);
    const link = await getReferralLinkById(db, id);

    if (!link) {
      return new Response(JSON.stringify({ error: 'Link no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stats = await getClickStats(db, id);

    return new Response(JSON.stringify({ link, stats }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching link stats:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener estadísticas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
