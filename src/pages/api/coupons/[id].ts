import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getCouponById, updateCoupon, deleteCoupon } from '@/lib/db/queries/coupons';
import { updateCouponSchema } from '@/lib/validations/coupon';

// GET /api/coupons/[id] - Get single coupon (admin only)
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
    const coupon = await getCouponById(db, id);

    if (!coupon) {
      return new Response(JSON.stringify({ error: 'Cupón no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ coupon }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener cupón' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/coupons/[id] - Update coupon (admin only)
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
    const validationResult = updateCouponSchema.safeParse(body);

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
    const existing = await getCouponById(db, id);

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Cupón no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const coupon = await updateCoupon(db, id, validationResult.data);

    return new Response(JSON.stringify({ coupon }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar cupón';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/coupons/[id] - Delete coupon (admin only)
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
    const existing = await getCouponById(db, id);

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Cupón no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteCoupon(db, id);

    return new Response(JSON.stringify({ message: 'Cupón eliminado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar cupón' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
