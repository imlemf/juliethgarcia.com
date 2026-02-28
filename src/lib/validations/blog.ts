import { z } from 'zod';

// Helper to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// Blog Category schemas
export const createBlogCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(100, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(200, 'La descripción es muy larga').optional(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const updateBlogCategorySchema = createBlogCategorySchema.partial();

// Blog schemas
export const createBlogSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(200, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  excerpt: z.string().max(500, 'El resumen es muy largo').optional(),
  content: z.string().min(1, 'El contenido es requerido'),
  coverImage: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  categoryId: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  isPremium: z.boolean().default(false),
});

export const updateBlogSchema = createBlogSchema.partial();

// Types
export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
