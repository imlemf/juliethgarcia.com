import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getActiveOfferForProduct } from '@/lib/db/queries/offers';
import { getActiveOfferSchema } from '@/lib/validations/coupon';

// POST /api/offers/active - Get active offer for a product (public)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validationResult = getActiveOfferSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          hasOffer: false,
          error: 'Datos inválidos',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { productId, amount } = validationResult.data;
    const db = getDb(locals.runtime);

    const result = await getActiveOfferForProduct(db, productId, amount);

    if (!result.offer) {
      return new Response(
        JSON.stringify({
          hasOffer: false,
          finalAmount: result.finalAmount,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        hasOffer: true,
        offerId: result.offer.id,
        offerName: result.offer.name,
        offerDescription: result.offer.description,
        discountType: result.offer.discountType,
        discountValue: result.offer.discountValue,
        discount: result.discount,
        finalAmount: result.finalAmount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting active offer:', error);
    return new Response(
      JSON.stringify({
        hasOffer: false,
        error: 'Error al obtener oferta activa',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
