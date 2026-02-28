import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getReferralLinkById, updateReferralLink, deleteReferralLink } from '@/lib/db/queries/referral-links';
import { updateReferralLinkSchema } from '@/lib/validations/referral';

// GET /api/referral-links/[id] - Get single link
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
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

    return new Response(JSON.stringify({ link }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching referral link:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/referral-links/[id] - Update link (admin only)
export const PATCH: APIRoute = async ({ params, request, locals }) => {
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

    const body = await request.json();
    const validationResult = updateReferralLinkSchema.safeParse(body);

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
    const existing = await getReferralLinkById(db, id);

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Link no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const link = await updateReferralLink(db, id, validationResult.data);

    return new Response(JSON.stringify({ link }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating referral link:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar link';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/referral-links/[id] - Delete link (admin only)
export const DELETE: APIRoute = async ({ params, locals }) => {
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
    const existing = await getReferralLinkById(db, id);

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Link no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteReferralLink(db, id);

    return new Response(JSON.stringify({ message: 'Link eliminado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting referral link:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
