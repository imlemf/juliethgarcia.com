import { z } from 'zod';

// Coupon schemas
export const createCouponSchema = z.object({
  code: z.string()
    .min(1, 'El código es requerido')
    .max(50, 'El código es muy largo')
    .regex(/^[A-Z0-9-_]+$/i, 'El código solo puede contener letras, números, guiones y guiones bajos')
    .transform(val => val.toUpperCase()),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  description: z.string().max(500, 'La descripción es muy larga').optional().nullable(),

  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number()
    .min(1, 'El valor del descuento debe ser mayor a 0')
    .refine((val) => val > 0, 'El valor debe ser positivo'),

  minPurchaseAmount: z.number().min(0).optional().nullable(),
  maxDiscountAmount: z.number().min(0).optional().nullable(),

  usageLimit: z.number().min(1).optional().nullable(),
  usageLimitPerUser: z.number().min(1).optional().nullable(),

  productIds: z.array(z.string()).optional().nullable()
    .transform(val => val && val.length > 0 ? JSON.stringify(val) : null),

  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),

  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      return false;
    }
    return true;
  },
  { message: 'El porcentaje no puede ser mayor a 100', path: ['discountValue'] }
).refine(
  (data) => {
    if (data.startsAt && data.expiresAt && data.startsAt >= data.expiresAt) {
      return false;
    }
    return true;
  },
  { message: 'La fecha de expiración debe ser posterior a la fecha de inicio', path: ['expiresAt'] }
);

export const updateCouponSchema = z.object({
  code: z.string()
    .min(1, 'El código es requerido')
    .max(50, 'El código es muy largo')
    .regex(/^[A-Z0-9-_]+$/i, 'El código solo puede contener letras, números, guiones y guiones bajos')
    .transform(val => val.toUpperCase())
    .optional(),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  description: z.string().max(500, 'La descripción es muy larga').optional().nullable(),

  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(1, 'El valor del descuento debe ser mayor a 0').optional(),

  minPurchaseAmount: z.number().min(0).optional().nullable(),
  maxDiscountAmount: z.number().min(0).optional().nullable(),

  usageLimit: z.number().min(1).optional().nullable(),
  usageLimitPerUser: z.number().min(1).optional().nullable(),

  productIds: z.array(z.string()).optional().nullable()
    .transform(val => val && val.length > 0 ? JSON.stringify(val) : null),

  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),

  isActive: z.boolean().optional(),
});

// Validate coupon code (for public use)
export const validateCouponSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  productId: z.string().min(1, 'El producto es requerido'),
  email: z.string().email('Email inválido').optional(),
  amount: z.number().min(1, 'El monto debe ser mayor a 0').optional(),
});

// Offer schemas
export const createOfferSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  description: z.string().max(500, 'La descripción es muy larga').optional().nullable(),

  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number()
    .min(1, 'El valor del descuento debe ser mayor a 0')
    .refine((val) => val > 0, 'El valor debe ser positivo'),

  minPurchaseAmount: z.number().min(0).optional().nullable(),
  maxDiscountAmount: z.number().min(0).optional().nullable(),

  usageLimit: z.number().min(1).optional().nullable(),
  usageLimitPerUser: z.number().min(1).optional().nullable(),

  productIds: z.array(z.string()).optional().nullable()
    .transform(val => val && val.length > 0 ? JSON.stringify(val) : null),

  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),

  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      return false;
    }
    return true;
  },
  { message: 'El porcentaje no puede ser mayor a 100', path: ['discountValue'] }
).refine(
  (data) => {
    // Only validate if both dates are provided
    if (data.startsAt && data.expiresAt) {
      return data.startsAt < data.expiresAt;
    }
    return true;
  },
  { message: 'La fecha de fin debe ser posterior a la fecha de inicio', path: ['expiresAt'] }
);

export const updateOfferSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  description: z.string().max(500, 'La descripción es muy larga').optional().nullable(),

  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(1, 'El valor del descuento debe ser mayor a 0').optional(),

  minPurchaseAmount: z.number().min(0).optional().nullable(),
  maxDiscountAmount: z.number().min(0).optional().nullable(),

  usageLimit: z.number().min(1).optional().nullable(),
  usageLimitPerUser: z.number().min(1).optional().nullable(),

  productIds: z.array(z.string()).optional().nullable()
    .transform(val => val && val.length > 0 ? JSON.stringify(val) : null),

  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),

  isActive: z.boolean().optional(),
});

// Get active offer for product (public use)
export const getActiveOfferSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
});

// Types
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type GetActiveOfferInput = z.infer<typeof getActiveOfferSchema>;
