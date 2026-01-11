import { Preference } from 'mercadopago';
import { getMercadoPagoClient } from './client';

export interface CreatePreferenceData {
  productId: string;
  productName: string;
  productDescription: string;
  price: number; // in cents
  currency: string;
  buyerEmail: string;
}

export async function createPaymentPreference(data: CreatePreferenceData) {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
      success: `${appUrl}/thank-you`,
      failure: `${appUrl}/products/${data.productId}`,
      pending: `${appUrl}/thank-you`,
    },
    auto_return: 'approved' as const,
    notification_url: `${appUrl}/api/payments/webhook`,
    metadata: {
      product_id: data.productId,
      buyer_email: data.buyerEmail,
    },
  };

  const response = await preference.create({ body });

  return {
    id: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
  };
}
