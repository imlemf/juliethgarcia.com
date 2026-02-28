export interface CreatePreferenceData {
  purchaseId: string;
  productId: string;
  productSlug: string;
  productName: string;
  productDescription: string;
  price: number; // in cents
  currency: string;
  buyerEmail: string;
}

export async function createPaymentPreference(
  data: CreatePreferenceData,
  runtime: { env: { MERCADOPAGO_ACCESS_TOKEN?: string; PUBLIC_APP_URL?: string } }
) {
  const accessToken = runtime.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
  }

  const appUrl = runtime.env.PUBLIC_APP_URL || 'https://example.com';

  console.log('Creating MercadoPago preference with appUrl:', appUrl);

  const body = {
    items: [
      {
        id: data.productId,
        title: data.productName,
        description: data.productDescription,
        quantity: 1,
        unit_price: data.price / 100, // Convert cents to currency units
        currency_id: data.currency,
      },
    ],
    payer: {
      email: data.buyerEmail,
    },
    back_urls: {
      success: `${appUrl}/checkout/result`,
      failure: `${appUrl}/checkout/result`,
      pending: `${appUrl}/checkout/result`,
    },
    ...(appUrl.startsWith('https') ? { auto_return: 'approved' } : {}),
    notification_url: `${appUrl}/api/payments/webhook`,
    external_reference: data.productSlug,
    metadata: {
      purchase_id: data.purchaseId,
      product_id: data.productId,
      buyer_email: data.buyerEmail,
    },
  };

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-Product-Id': 'checkout-pro',
      'X-Integrator-Id': '',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('MercadoPago API error:', response.status, errorData);
    throw new Error(`MercadoPago error: ${response.status} - ${errorData}`);
  }

  const result = await response.json() as {
    id: string;
    init_point: string;
    sandbox_init_point: string;
  };

  return {
    id: result.id,
    initPoint: result.init_point,
    sandboxInitPoint: result.sandbox_init_point,
  };
}
