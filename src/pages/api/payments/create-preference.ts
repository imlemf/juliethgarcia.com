import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getProductById } from '@/lib/db/queries/products';
import { createInitializedPurchase, updatePurchase } from '@/lib/db/queries/purchases';
import { validateCoupon } from '@/lib/db/queries/coupons';
import { getActiveOfferForProduct, getOfferById } from '@/lib/db/queries/offers';
import { createPaymentPreference } from '@/lib/mercadopago/preference';
import { validateTurnstile } from '@/lib/auth/turnstile';
import { createPreferenceSchema } from '@/lib/validations/payments';
import { handleApiError, ErrorResponses } from '@/lib/utils/error-handler';
import { generatePurchaseCode } from '@/lib/utils/generate-code';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    // Validate input
    const { productId, buyerEmail: bodyEmail, turnstileToken, couponId, offerId } = createPreferenceSchema.parse(body);

    // Get email from user if authenticated, otherwise use provided email
    const user = locals.user;
    const buyerEmail = user?.email || bodyEmail;

    if (!buyerEmail) {
      throw ErrorResponses.badRequest('Email es requerido');
    }

    // Validate Turnstile token (anti-bot protection)
    const turnstileValidation = await validateTurnstile(turnstileToken);
    if (!turnstileValidation.success) {
      throw ErrorResponses.forbidden(turnstileValidation.error || 'Bot detection failed');
    }

    // Get product from database
    const db = getDb(locals.runtime);
    const product = await getProductById(db, productId);

    if (!product) {
      throw ErrorResponses.notFound('Product');
    }

    if (!product.isActive) {
      throw ErrorResponses.badRequest('Product is not available');
    }

    // Calculate discount
    let finalAmount = product.price;
    let discountAmount = 0;
    let discountSource: 'coupon' | 'offer' | undefined;
    let appliedCouponId: string | undefined;
    let appliedOfferId: string | undefined;

    // Priority: Coupon > Offer
    if (couponId) {
      // Get the coupon first to validate it
      const { getCouponById } = await import('@/lib/db/queries/coupons');
      const coupon = await getCouponById(db, couponId);

      if (coupon) {
        // Re-validate using the coupon code
        const validation = await validateCoupon(db, coupon.code, productId, buyerEmail, product.price);

        if (validation.valid && validation.coupon) {
          finalAmount = validation.finalAmount!;
          discountAmount = validation.discount!;
          discountSource = 'coupon';
          appliedCouponId = couponId;
        } else {
          throw ErrorResponses.badRequest(validation.error || 'Cupón inválido');
        }
      } else {
        throw ErrorResponses.badRequest('Cupón no encontrado');
      }
    } else if (offerId) {
      // Validate that the offer exists and is active
      const offer = await getOfferById(db, offerId);

      if (!offer) {
        throw ErrorResponses.badRequest('Oferta no encontrada');
      }

      // Get active offer for this product to verify it's still valid
      const activeOffer = await getActiveOfferForProduct(db, productId, product.price);

      if (activeOffer.offer && activeOffer.offer.id === offerId) {
        finalAmount = activeOffer.finalAmount;
        discountAmount = activeOffer.discount;
        discountSource = 'offer';
        appliedOfferId = offerId;
      } else {
        throw ErrorResponses.badRequest('La oferta ya no está disponible');
      }
    }

    // Create purchase with 'initialized' status before generating payment link
    const purchaseCode = generatePurchaseCode();
    const purchase = await createInitializedPurchase(db, {
      productId: product.id,
      email: buyerEmail,
      purchaseCode,
      paymentProvider: 'mercadopago',
      checkoutUrl: '', // Will be updated after preference creation
      amount: finalAmount,
      currency: product.currency,
      // Discount info
      couponId: appliedCouponId,
      offerId: appliedOfferId,
      discountSource,
      discountAmount,
      originalAmount: discountAmount > 0 ? product.price : undefined,
    });

    // Create Mercado Pago preference with purchaseId in metadata
    // Use the final amount (with discount applied)
    const preference = await createPaymentPreference({
      purchaseId: purchase.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productDescription: product.description,
      price: finalAmount, // Use discounted price
      currency: product.currency,
      buyerEmail,
    });

    // Update purchase with checkout URL
    await updatePurchase(db, purchase.id, {
      checkoutUrl: preference.initPoint,
    });

    return new Response(
      JSON.stringify({
        preferenceId: preference.id,
        initPoint: preference.initPoint,
        sandboxInitPoint: preference.sandboxInitPoint,
        purchaseId: purchase.id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
