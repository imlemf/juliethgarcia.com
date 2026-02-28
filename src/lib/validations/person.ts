import { z } from 'zod';

// Helper to generate slug from name
export function generatePersonSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// Person Category schemas
export const createPersonCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(100, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(200, 'La descripción es muy larga').optional().nullable(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const updatePersonCategorySchema = createPersonCategorySchema.partial();

// Person Title schemas
export const createPersonTitleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(100, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const updatePersonTitleSchema = createPersonTitleSchema.partial();

// Skill schemas
export const createSkillSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(100, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(200, 'La descripción es muy larga').optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (usa formato #RRGGBB)').optional().nullable(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const updateSkillSchema = createSkillSchema.partial();

// Person skill assignment schema (for many-to-many)
export const personSkillSchema = z.object({
  skillId: z.string().min(1, 'El skill es requerido'),
  order: z.number().min(0).optional(),
});

// Person schemas
export const createPersonSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(100, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  titleId: z.string().optional().nullable(),
  shortBio: z.string().max(300, 'La descripción corta es muy larga').optional().nullable(),
  bio: z.string().max(10000, 'La biografía es muy larga').optional().nullable(),
  avatarUrl: z.string().url('URL de imagen inválida').optional().nullable().or(z.literal('')),
  avatarFileId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),

  // Contact fields with visibility
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  emailIsPublic: z.boolean().default(false),
  phone: z.string().max(20, 'El teléfono es muy largo').optional().nullable(),
  phoneIsPublic: z.boolean().default(false),
  whatsapp: z.string().max(20, 'El WhatsApp es muy largo').optional().nullable(),
  whatsappIsPublic: z.boolean().default(false),

  // Social links
  website: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  instagram: z.string().max(100, 'El usuario de Instagram es muy largo').optional().nullable(),

  // Status
  order: z.number().min(0).optional(),
  isPublished: z.boolean().default(false),

  // Skills (many-to-many)
  skills: z.array(personSkillSchema).optional().default([]),
});

export const updatePersonSchema = createPersonSchema.partial();

// Types
export type CreatePersonCategoryInput = z.infer<typeof createPersonCategorySchema>;
export type UpdatePersonCategoryInput = z.infer<typeof updatePersonCategorySchema>;
export type CreatePersonTitleInput = z.infer<typeof createPersonTitleSchema>;
export type UpdatePersonTitleInput = z.infer<typeof updatePersonTitleSchema>;
export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
export type PersonSkillInput = z.infer<typeof personSkillSchema>;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
