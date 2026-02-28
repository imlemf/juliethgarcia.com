import { z } from 'zod';

export const createPreferenceSchema = z.object({
  productId: z.string().min(1, 'Product ID es requerido'),
  buyerEmail: z.string().email('Email inválido').optional(),
  turnstileToken: z.string().min(1, 'Verificación anti-bot requerida'),
  couponId: z.string().optional(),
  offerId: z.string().optional(),
});

export type CreatePreferenceInput = z.infer<typeof createPreferenceSchema>;
