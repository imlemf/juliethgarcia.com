import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getOfferById, updateOffer, deleteOffer, canActivateOffer, MAX_ACTIVE_OFFERS } from '@/lib/db/queries/offers';
import { updateOfferSchema } from '@/lib/validations/coupon';

// GET /api/offers/[id] - Get single offer (admin only)
export const GET: APIRoute = async ({ params, locals }) => {
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
    const offer = await getOfferById(db, id);

    if (!offer) {
      return new Response(JSON.stringify({ error: 'Oferta no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ offer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener oferta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/offers/[id] - Update offer (admin only)
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
    const validationResult = updateOfferSchema.safeParse(body);

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
    const existing = await getOfferById(db, id);

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Oferta no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = validationResult.data;
    const now = new Date();

    // Determine if the offer would become active after this update
    const newIsActive = data.isActive ?? existing.isActive;
    const newStartsAt = data.startsAt !== undefined ? data.startsAt : existing.startsAt;
    const newEndsAt = data.expiresAt !== undefined ? data.expiresAt : existing.expiresAt;
    const startsOk = !newStartsAt || newStartsAt <= now;
    const endsOk = !newEndsAt || newEndsAt >= now;
    const wouldBeActive = newIsActive && startsOk && endsOk;

    // Check if offer was not active before but would be active after update
    const existingStartsOk = !existing.startsAt || existing.startsAt <= now;
    const existingEndsOk = !existing.expiresAt || existing.expiresAt >= now;
    const wasActive = existing.isActive && existingStartsOk && existingEndsOk;

    if (wouldBeActive && !wasActive) {
      const canActivate = await canActivateOffer(db, id);
      if (!canActivate) {
        return new Response(
          JSON.stringify({
            error: `Ya hay ${MAX_ACTIVE_OFFERS} ofertas activas. Desactiva una antes de activar otra.`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const offer = await updateOffer(db, id, data);

    return new Response(JSON.stringify({ offer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar oferta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/offers/[id] - Delete offer (admin only)
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
    const existing = await getOfferById(db, id);

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Oferta no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteOffer(db, id);

    return new Response(JSON.stringify({ message: 'Oferta eliminada' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar oferta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
