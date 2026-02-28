import { z } from 'zod';

// Social media templates with URL validation patterns
export const SOCIAL_TEMPLATES = {
  instagram: {
    name: 'Instagram',
    icon: 'SiInstagram',
    iconType: 'simple-icons' as const,
    urlPrefix: 'https://instagram.com/',
    inputPlaceholder: 'usuario',
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/.+$/,
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: 'SiWhatsapp',
    iconType: 'simple-icons' as const,
    urlPrefix: 'https://wa.me/',
    inputPlaceholder: '573001234567',
    urlPattern: /^https?:\/\/(wa\.me|whatsapp\.com|api\.whatsapp\.com)\/.+$/,
  },
  email: {
    name: 'Email',
    icon: 'Mail',
    iconType: 'lucide' as const,
    urlPrefix: 'mailto:',
    inputPlaceholder: 'correo@ejemplo.com',
    urlPattern: /^mailto:.+@.+\..+$/,
  },
  twitter: {
    name: 'X',
    icon: 'SiX',
    iconType: 'simple-icons' as const,
    urlPrefix: 'https://x.com/',
    inputPlaceholder: 'usuario',
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+$/,
  },
  youtube: {
    name: 'YouTube',
    icon: 'SiYoutube',
    iconType: 'simple-icons' as const,
    urlPrefix: 'https://youtube.com/@',
    inputPlaceholder: 'canal',
    urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
  },
  facebook: {
    name: 'Facebook',
    icon: 'SiFacebook',
    iconType: 'simple-icons' as const,
    urlPrefix: 'https://facebook.com/',
    inputPlaceholder: 'usuario',
    urlPattern: /^https?:\/\/(www\.)?facebook\.com\/.+$/,
  },
  tiktok: {
    name: 'TikTok',
    icon: 'SiTiktok',
    iconType: 'simple-icons' as const,
    urlPrefix: 'https://tiktok.com/@',
    inputPlaceholder: 'usuario',
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@.+$/,
  },
} as const;

export type SocialPlatform = keyof typeof SOCIAL_TEMPLATES;

// Create link schema
export const createSiteLinkSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es demasiado largo'),
  url: z.string().url('URL inválida').max(500, 'La URL es demasiado larga'),
  icon: z.string().min(1, 'El ícono es requerido').max(50, 'El ícono es demasiado largo'),
  iconType: z.enum(['emoji', 'lucide', 'simple-icons'], {
    errorMap: () => ({ message: 'Tipo de ícono inválido' }),
  }),
  linkType: z.enum(['social', 'custom'], {
    errorMap: () => ({ message: 'Tipo de enlace inválido' }),
  }),
  order: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

// Update link schema (partial)
export const updateSiteLinkSchema = createSiteLinkSchema.partial();

// Reorder schema (bulk update)
export const reorderSiteLinksSchema = z.object({
  linkOrders: z.array(
    z.object({
      id: z.string().min(1, 'ID es requerido'),
      order: z.number().min(0, 'Orden debe ser mayor o igual a 0'),
    })
  ),
});

export type CreateSiteLinkInput = z.infer<typeof createSiteLinkSchema>;
export type UpdateSiteLinkInput = z.infer<typeof updateSiteLinkSchema>;
export type ReorderSiteLinksInput = z.infer<typeof reorderSiteLinksSchema>;
