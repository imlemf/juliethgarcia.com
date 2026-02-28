import { MercadoPagoConfig } from 'mercadopago';

export function getMercadoPagoClient(runtime: { env: { MERCADOPAGO_ACCESS_TOKEN?: string } }): MercadoPagoConfig {
  const accessToken = runtime.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN environment variable is not set');
  }

  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000,
    },
  });
}
