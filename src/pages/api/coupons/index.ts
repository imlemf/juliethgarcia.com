import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getAllCoupons, createCoupon } from '@/lib/db/queries/coupons';
import { createCouponSchema } from '@/lib/validations/coupon';

// GET /api/coupons - List coupons (admin only)
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
    const coupons = await getAllCoupons(db);

    return new Response(JSON.stringify({ coupons }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener cupones' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/coupons - Create coupon (admin only)
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
    const validationResult = createCouponSchema.safeParse(body);

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
    const coupon = await createCoupon(db, validationResult.data);

    return new Response(JSON.stringify({ coupon }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    const message = error instanceof Error ? error.message : 'Error al crear cupón';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
