import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getPurchaseById, updatePurchase, getOrCreatePurchase } from '@/lib/db/queries/purchases';
import { createDownloadLink, getDownloadLinksByPurchaseId } from '@/lib/db/queries/downloads';
import { incrementCouponUsage, recordCouponUsage } from '@/lib/db/queries/coupons';
import { incrementOfferUsage, recordOfferUsage } from '@/lib/db/queries/offers';
import { extendUserPremiumByEmail, getUserByEmail } from '@/lib/db/queries/users';
import { validateWebhookSignature } from '@/lib/mercadopago/webhook';
import { generatePurchaseCode } from '@/lib/utils/generate-code';
import { generateDownloadToken } from '@/lib/utils/generate-token';
import { sendPurchaseEmail } from '@/lib/email/send';
import { getProductById } from '@/lib/db/queries/products';
import { getSetting } from '@/lib/settings';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get headers
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature || !xRequestId) {
      console.error('Missing webhook headers');
      return new Response(JSON.stringify({ error: 'Missing headers' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get data.id from query params
    const url = new URL(request.url);
    const dataId = url.searchParams.get('data.id');

    if (!dataId) {
      console.error('Missing data.id in query params');
      return new Response(JSON.stringify({ error: 'Missing data.id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate signature
    const isValidSignature = await validateWebhookSignature(xSignature, xRequestId, dataId);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse body
    const body = (await request.json()) as {
      type: string;
      action: string;
      data: { id: string };
    };
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Only process payment.updated
    if (body.type !== 'payment' || body.action !== 'payment.updated') {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const paymentId = body.data.id;

    // Fetch payment from Mercado Pago
    const mpAccessToken = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
      },
    });

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment from Mercado Pago');
      return new Response(JSON.stringify({ error: 'Failed to fetch payment' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payment = (await paymentResponse.json()) as {
      status: string;
      status_detail?: string;
      transaction_amount: number;
      currency_id: string;
      order?: { id?: string };
      metadata?: { purchase_id?: string; product_id?: string; buyer_email?: string };
      payer?: { email?: string };
    };
    console.log('Payment details:', JSON.stringify(payment, null, 2));

    // Extract metadata
    const purchaseId = payment.metadata?.purchase_id;
    const productId = payment.metadata?.product_id;

    if (!productId) {
      console.error('Missing product_id in payment metadata');
      return new Response(JSON.stringify({ error: 'Missing metadata' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);

    // Map MercadoPago status to our status
    let purchaseStatus: 'initialized' | 'pending' | 'completed' | 'refunded' | 'failed' = 'pending';
    if (payment.status === 'approved') {
      purchaseStatus = 'completed';
    } else if (payment.status === 'pending' || payment.status === 'in_process') {
      purchaseStatus = 'pending';
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      purchaseStatus = 'failed';
    } else if (payment.status === 'refunded') {
      purchaseStatus = 'refunded';
    }

    let purchase;
    let created = false;
    let buyerEmail: string | undefined;

    // Try to find existing purchase by purchaseId (new flow)
    if (purchaseId) {
      purchase = await getPurchaseById(db, purchaseId);
      if (purchase) {
        // Get email from the purchase record (set during checkout)
        buyerEmail = purchase.email;

        // Update existing purchase with payment info
        purchase = await updatePurchase(db, purchaseId, {
          externalPaymentId: paymentId,
          externalOrderId: payment.order?.id,
          providerStatus: payment.status,
          providerStatusDetail: payment.status_detail,
          status: purchaseStatus,
        });
        console.log(`Purchase ${purchaseId} updated with status ${purchaseStatus}`);

        // Check if already processed (has download links)
        if (purchaseStatus === 'completed') {
          const existingLinks = await getDownloadLinksByPurchaseId(db, purchaseId);
          if (existingLinks.length > 0) {
            console.log(`Purchase ${purchaseId} already has download links, skipping`);
            return new Response(JSON.stringify({ received: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          created = true; // Signal to create download link
        }
      }
    }

    // Fallback: create new purchase if not found (for backward compatibility or if purchaseId missing)
    if (!purchase) {
      // Only in fallback mode, use email from metadata
      buyerEmail = payment.metadata?.buyer_email || payment.payer?.email;

      if (!buyerEmail) {
        console.error('Missing buyer_email in payment metadata');
        return new Response(JSON.stringify({ error: 'Missing buyer email' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const purchaseCode = generatePurchaseCode();
      const result = await getOrCreatePurchase(db, {
        productId,
        email: buyerEmail,
        purchaseCode,
        paymentProvider: 'mercadopago',
        externalPaymentId: paymentId,
        externalOrderId: payment.order?.id,
        providerStatus: payment.status,
        providerStatusDetail: payment.status_detail,
        amount: Math.round(payment.transaction_amount * 100),
        currency: payment.currency_id,
        status: purchaseStatus,
      });
      purchase = result.purchase;
      created = result.created;
    }

    // Only process completed payments for download link creation
    if (purchaseStatus !== 'completed' || !created) {
      console.log(`Payment ${paymentId} status is ${payment.status}, ${created ? 'processed' : 'already processed'}`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Purchase ready for download link:', purchase.id);

    // Create download link
    const expiryHours = parseInt(import.meta.env.DOWNLOAD_LINK_EXPIRY_HOURS || '48');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const downloadToken = generateDownloadToken();
    const downloadLink = await createDownloadLink(db, {
      purchaseId: purchase.id,
      productId,
      token: downloadToken,
      expiresAt,
      maxDownloads: parseInt(import.meta.env.MAX_DOWNLOADS_PER_PURCHASE || '5'),
    });

    console.log('Download link created:', downloadLink.id);

    // Record coupon usage if a coupon was applied
    if (purchase.couponId && purchase.discountAmount > 0) {
      try {
        await incrementCouponUsage(db, purchase.couponId);
        await recordCouponUsage(db, {
          couponId: purchase.couponId,
          purchaseId: purchase.id,
          userId: purchase.userId || undefined,
          email: purchase.email,
          discountApplied: purchase.discountAmount,
        });
        console.log('Coupon usage recorded for coupon:', purchase.couponId);
      } catch (couponError) {
        // Log error but don't fail the webhook
        console.error('Failed to record coupon usage:', couponError);
      }
    }

    // Record offer usage if an offer was applied
    if (purchase.offerId && purchase.discountAmount > 0) {
      try {
        await incrementOfferUsage(db, purchase.offerId);
        await recordOfferUsage(db, {
          offerId: purchase.offerId,
          purchaseId: purchase.id,
          userId: purchase.userId || undefined,
          email: purchase.email,
          discountApplied: purchase.discountAmount,
        });
        console.log('Offer usage recorded for offer:', purchase.offerId);
      } catch (offerError) {
        // Log error but don't fail the webhook
        console.error('Failed to record offer usage:', offerError);
      }
    }

    // Get product details for email
    const product = await getProductById(db, productId);

    if (!product) {
      console.error('Product not found for purchase email');
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use email from purchase record
    const emailToUse = purchase.email;

    // Send purchase confirmation email (non-blocking failure)
    try {
      const existingUser = await getUserByEmail(db, emailToUse);
      await sendPurchaseEmail({
        to: emailToUse,
        productName: product.name,
        productDescription: product.description || undefined,
        purchaseCode: purchase.purchaseCode,
        downloadToken,
        amount: Math.round(payment.transaction_amount * 100),
        currency: payment.currency_id,
        expiresAt,
        maxDownloads: parseInt(import.meta.env.MAX_DOWNLOADS_PER_PURCHASE || '5'),
        isRegistered: !!existingUser,
      });
      console.log('Purchase confirmation email sent to:', emailToUse);
    } catch (emailError) {
      // Log error but don't fail the webhook
      console.error('Failed to send purchase email:', emailError);
    }

    // Extend premium subscription for the buyer
    try {
      const subscriptionMonths = await getSetting(locals.runtime, 'commerce.subscriptionDurationMonths');
      const newPremiumUntil = await extendUserPremiumByEmail(db, emailToUse, subscriptionMonths);
      if (newPremiumUntil) {
        console.log(`Premium extended for ${emailToUse} until ${newPremiumUntil.toISOString()}`);
      } else {
        // User not registered yet - premium will be granted when they register with purchase code
        console.log(`User ${emailToUse} not registered yet, premium will be granted on registration`);
      }
    } catch (premiumError) {
      // Log error but don't fail the webhook
      console.error('Failed to extend premium:', premiumError);
    }

    return new Response(
      JSON.stringify({
        received: true,
        purchaseId: purchase.id,
        downloadToken,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
