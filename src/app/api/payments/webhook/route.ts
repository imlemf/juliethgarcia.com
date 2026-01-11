import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createPurchase, getPurchaseByPaymentId } from '@/lib/db/queries/purchases';
import { createDownloadLink } from '@/lib/db/queries/downloads';
import { validateWebhookSignature } from '@/lib/mercadopago/webhook';
import { generatePurchaseCode } from '@/lib/utils/generate-code';
import { generateDownloadToken } from '@/lib/utils/generate-token';
import { sendPurchaseEmail } from '@/lib/email/send';
import { getProductById } from '@/lib/db/queries/products';

export const runtime = 'edge';

// POST /api/payments/webhook - Mercado Pago webhook handler
export async function POST(request: NextRequest) {
  try {
    // Get headers
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature || !xRequestId) {
      console.error('Missing webhook headers');
      return NextResponse.json({ error: 'Missing headers' }, { status: 401 });
    }

    // Get data.id from query params
    const url = new URL(request.url);
    const dataId = url.searchParams.get('data.id');

    if (!dataId) {
      console.error('Missing data.id in query params');
      return NextResponse.json({ error: 'Missing data.id' }, { status: 400 });
    }

    // Validate webhook signature
    const isValidSignature = await validateWebhookSignature(xSignature, xRequestId, dataId);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook body
    const body = await request.json() as {
      type: string;
      action: string;
      data: { id: string };
    };
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Only process payment notifications
    if (body.type !== 'payment' || body.action !== 'payment.updated') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paymentId = body.data.id;

    // Fetch payment details from Mercado Pago API
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment from Mercado Pago');
      return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
    }

    const payment = await paymentResponse.json() as {
      status: string;
      status_detail?: string;
      transaction_amount: number;
      currency_id: string;
      order?: { id?: string };
      metadata?: { product_id?: string; buyer_email?: string };
      payer?: { email?: string };
    };
    console.log('Payment details:', JSON.stringify(payment, null, 2));

    // Only process approved payments
    if (payment.status !== 'approved') {
      console.log(`Payment ${paymentId} status is ${payment.status}, skipping`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const db = getDb((request as any).env?.DB);

    // Check if purchase already exists (idempotency)
    const existingPurchase = await getPurchaseByPaymentId(db, paymentId);
    if (existingPurchase) {
      console.log(`Purchase for payment ${paymentId} already exists, skipping`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Extract metadata
    const productId = payment.metadata?.product_id;
    const buyerEmail = payment.metadata?.buyer_email || payment.payer?.email;

    if (!productId || !buyerEmail) {
      console.error('Missing product_id or buyer_email in payment metadata');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Generate unique purchase code
    const purchaseCode = generatePurchaseCode();

    // Create purchase record
    const purchase = await createPurchase(db, {
      productId,
      email: buyerEmail,
      purchaseCode,
      mpPaymentId: paymentId,
      mpOrderId: payment.order?.id,
      mpStatus: payment.status,
      mpStatusDetail: payment.status_detail,
      amount: Math.round(payment.transaction_amount * 100), // Convert to cents
      currency: payment.currency_id,
      status: 'completed',
    });

    console.log('Purchase created:', purchase.id);

    // Generate download link with expiration
    const expiryHours = parseInt(process.env.DOWNLOAD_LINK_EXPIRY_HOURS || '48');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const downloadToken = generateDownloadToken();

    const downloadLink = await createDownloadLink(db, {
      purchaseId: purchase.id,
      productId,
      token: downloadToken,
      expiresAt,
      maxDownloads: parseInt(process.env.MAX_DOWNLOADS_PER_PURCHASE || '5'),
    });

    console.log('Download link created:', downloadLink.id);

    // Get product details for email
    const product = await getProductById(db, productId);

    if (!product) {
      console.error('Product not found for purchase email');
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Send purchase confirmation email
    try {
      await sendPurchaseEmail({
        to: buyerEmail,
        productName: product.name,
        productDescription: product.description || undefined,
        purchaseCode,
        downloadToken,
        amount: Math.round(payment.transaction_amount * 100), // Convert to cents
        currency: payment.currency_id,
        expiresAt,
        maxDownloads: parseInt(process.env.MAX_DOWNLOADS_PER_PURCHASE || '5'),
      });
      console.log('Purchase confirmation email sent to:', buyerEmail);
    } catch (emailError) {
      // Log error but don't fail the webhook
      // The purchase is already created successfully
      console.error('Failed to send purchase email:', emailError);
    }

    return NextResponse.json(
      {
        received: true,
        purchaseId: purchase.id,
        downloadToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
