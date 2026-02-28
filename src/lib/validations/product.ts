import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  currency: z.string().default('USD'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  fileKey: z.string().min(1, 'La clave del archivo es requerida'),
  fileName: z.string().min(1, 'El nombre del archivo es requerido'),
  fileSize: z.number().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  fileKey: z.string().min(1).optional(),
  fileName: z.string().min(1).optional(),
  fileSize: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
