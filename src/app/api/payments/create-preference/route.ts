import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getProductById } from '@/lib/db/queries/products';
import { createPaymentPreference } from '@/lib/mercadopago/preference';
import { validateTurnstile } from '@/lib/auth/turnstile';
import { createPreferenceSchema } from '@/lib/validations/payments';
import { handleApiError, ErrorResponses } from '@/lib/utils/error-handler';

export const runtime = 'edge';

// POST /api/payments/create-preference - Create Mercado Pago preference
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { productId, buyerEmail, turnstileToken } = createPreferenceSchema.parse(body);

    // Validate Turnstile token (anti-bot protection)
    const turnstileValidation = await validateTurnstile(turnstileToken);
    if (!turnstileValidation.success) {
      throw ErrorResponses.forbidden(turnstileValidation.error || 'Bot detection failed');
    }

    // Get product from database
    const db = getDb((request as any).env?.DB);
    const product = await getProductById(db, productId);

    if (!product) {
      throw ErrorResponses.notFound('Product');
    }

    if (!product.isActive) {
      throw ErrorResponses.badRequest('Product is not available');
    }

    // Create Mercado Pago preference
    const preference = await createPaymentPreference({
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      price: product.price,
      currency: product.currency,
      buyerEmail,
    });

    return NextResponse.json(
      {
        preferenceId: preference.id,
        initPoint: preference.initPoint,
        sandboxInitPoint: preference.sandboxInitPoint,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
