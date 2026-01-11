import { MercadoPagoConfig } from 'mercadopago';

let mpClient: MercadoPagoConfig | null = null;

export function getMercadoPagoClient(): MercadoPagoConfig {
  if (!mpClient) {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN environment variable is not set');
    }

    mpClient = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      },
    });
  }

  return mpClient;
}
