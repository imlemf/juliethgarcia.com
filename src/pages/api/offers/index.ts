import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getAllOffers, createOffer, canActivateOffer, MAX_ACTIVE_OFFERS } from '@/lib/db/queries/offers';
import { createOfferSchema } from '@/lib/validations/coupon';

// GET /api/offers - List offers (admin only)
export const GET: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);
    const offers = await getAllOffers(db);

    return new Response(JSON.stringify({ offers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener ofertas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/offers - Create offer (admin only)
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
    const validationResult = createOfferSchema.safeParse(body);

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
    const data = validationResult.data;

    // Check if this offer would be active and if we can have more active offers
    const now = new Date();
    const startsOk = !data.startsAt || data.startsAt <= now;
    const endsOk = !data.expiresAt || data.expiresAt >= now;
    const wouldBeActive = data.isActive && startsOk && endsOk;

    if (wouldBeActive) {
      const canActivate = await canActivateOffer(db);
      if (!canActivate) {
        return new Response(
          JSON.stringify({
            error: `Ya hay ${MAX_ACTIVE_OFFERS} ofertas activas. Desactiva una antes de crear otra.`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const offer = await createOffer(db, data);

    return new Response(JSON.stringify({ offer }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    return new Response(JSON.stringify({ error: 'Error al crear oferta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
