import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { validateCoupon } from '@/lib/db/queries/coupons';
import { validateCouponSchema } from '@/lib/validations/coupon';
import { products } from '@/db/schema';

// POST /api/coupons/validate - Validate coupon for a product (public)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validationResult = validateCouponSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Datos inválidos',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { code, productId, email: bodyEmail, amount: bodyAmount } = validationResult.data;
    const db = getDb(locals.runtime);

    // Get email from user if authenticated and not provided
    const user = locals.user;
    const email = bodyEmail || user?.email;

    // Get amount from product if not provided
    let amount = bodyAmount;
    if (!amount) {
      const [product] = await db
        .select({ price: products.price })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: 'Producto no encontrado',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      amount = product.price;
    }

    const result = await validateCoupon(db, code, productId, email, amount);

    if (!result.valid) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: result.error,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        couponId: result.coupon?.id,
        couponCode: result.coupon?.code,
        couponName: result.coupon?.name,
        discountType: result.coupon?.discountType,
        discountValue: result.coupon?.discountValue,
        discount: result.discount,
        finalAmount: result.finalAmount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error validating coupon:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Error al validar cupón',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
