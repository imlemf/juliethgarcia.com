import { z } from 'zod';

// Reuse slug generation from blog validations
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// Category schemas
export const createReferralCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(100, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(200, 'La descripción es muy larga').optional().nullable(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const updateReferralCategorySchema = createReferralCategorySchema.partial();

// Link schemas
export const createReferralLinkSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título es muy largo'),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .max(100, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(500, 'La descripción es muy larga').optional().nullable(),
  destinationUrl: z.string().url('URL de destino inválida'),
  image: z.string().url('URL de imagen inválida').optional().nullable().or(z.literal('')),
  categoryId: z.string().optional().nullable(),

  // UTM parameters
  utmSource: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(100).optional().nullable(),
  utmCampaign: z.string().max(100).optional().nullable(),
  utmTerm: z.string().max(100).optional().nullable(),
  utmContent: z.string().max(100).optional().nullable(),

  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

export const updateReferralLinkSchema = createReferralLinkSchema.partial();

// Utility function to build destination URL with UTM params
export function buildDestinationUrlWithUtm(
  baseUrl: string,
  utm: {
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmTerm?: string | null;
    utmContent?: string | null;
  }
): string {
  const url = new URL(baseUrl);
  if (utm.utmSource) url.searchParams.set('utm_source', utm.utmSource);
  if (utm.utmMedium) url.searchParams.set('utm_medium', utm.utmMedium);
  if (utm.utmCampaign) url.searchParams.set('utm_campaign', utm.utmCampaign);
  if (utm.utmTerm) url.searchParams.set('utm_term', utm.utmTerm);
  if (utm.utmContent) url.searchParams.set('utm_content', utm.utmContent);
  return url.toString();
}

// Types
export type CreateReferralCategoryInput = z.infer<typeof createReferralCategorySchema>;
export type UpdateReferralCategoryInput = z.infer<typeof updateReferralCategorySchema>;
export type CreateReferralLinkInput = z.infer<typeof createReferralLinkSchema>;
export type UpdateReferralLinkInput = z.infer<typeof updateReferralLinkSchema>;
