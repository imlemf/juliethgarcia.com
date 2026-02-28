import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  turnstileToken: z.string().min(1, 'Verificación anti-bot requerida'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  purchaseCode: z
    .string()
    .regex(/^[A-Z0-9]{12}$/, 'Código de compra inválido (debe ser 12 caracteres alfanuméricos)'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
  turnstileToken: z.string().min(1, 'Verificación anti-bot requerida'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
