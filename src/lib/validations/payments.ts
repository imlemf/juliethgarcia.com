import { z } from 'zod';

export const createPreferenceSchema = z.object({
  productId: z.string().min(1, 'Product ID es requerido'),
  buyerEmail: z.string().email('Email inválido'),
  turnstileToken: z.string().min(1, 'Verificación anti-bot requerida'),
});

export type CreatePreferenceInput = z.infer<typeof createPreferenceSchema>;
