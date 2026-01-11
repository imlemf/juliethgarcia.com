import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre es demasiado largo'),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .max(200, 'El slug es demasiado largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(2000, 'La descripción es demasiado larga').optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0').max(1000000000, 'Precio inválido'),
  currency: z.enum(['USD', 'ARS', 'MXN', 'CLP', 'COP', 'PEN', 'UYU', 'BRL'], {
    errorMap: () => ({ message: 'Moneda inválida' }),
  }),
  fileKey: z.string().min(1, 'El archivo es requerido'),
  fileName: z.string().min(1, 'El nombre del archivo es requerido').max(255),
  fileSize: z.number().min(1, 'El tamaño del archivo es requerido').max(5 * 1024 * 1024 * 1024), // 5GB max
  imageUrl: z.string().url('URL de imagen inválida').optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
