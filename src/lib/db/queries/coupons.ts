import { eq, and, or, isNull, lte, gte, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { coupons, couponUsages } from '@/db/schema';

type DB = DrizzleD1Database<Record<string, never>>;

export async function getAllCoupons(db: DB) {
  return db.select().from(coupons).orderBy(coupons.createdAt);
}

export async function getCouponById(db: DB, id: string) {
  const result = await db.select().from(coupons).where(eq(coupons.id, id));
  return result[0] || null;
}

export async function getCouponByCode(db: DB, code: string) {
  const result = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
  return result[0] || null;
}

export async function createCoupon(db: DB, data: {
  code: string;
  name: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  productIds?: string | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}) {
  const result = await db.insert(coupons).values({
    code: data.code.toUpperCase(),
    name: data.name,
    description: data.description,
    discountType: data.discountType,
    discountValue: data.discountValue,
    minPurchaseAmount: data.minPurchaseAmount,
    maxDiscountAmount: data.maxDiscountAmount,
    usageLimit: data.usageLimit,
    usageLimitPerUser: data.usageLimitPerUser,
    productIds: data.productIds,
    startsAt: data.startsAt,
    expiresAt: data.expiresAt,
    isActive: data.isActive ?? true,
  }).returning();
  return result[0];
}

export async function updateCoupon(db: DB, id: string, data: Partial<{
  code: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  productIds: string | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}>) {
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.code) updateData.code = data.code.toUpperCase();

  const result = await db.update(coupons)
    .set(updateData)
    .where(eq(coupons.id, id))
    .returning();
  return result[0];
}

export async function deleteCoupon(db: DB, id: string) {
  await db.delete(coupons).where(eq(coupons.id, id));
}

export async function incrementCouponUsage(db: DB, id: string) {
  await db.update(coupons)
    .set({
      usageCount: sql`${coupons.usageCount} + 1`,
      updatedAt: new Date()
    })
    .where(eq(coupons.id, id));
}

// Get usage count for a specific email
export async function getCouponUsageCountByEmail(db: DB, couponId: string, email: string) {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(couponUsages)
    .where(and(
      eq(couponUsages.couponId, couponId),
      eq(couponUsages.email, email.toLowerCase())
    ));
  return result[0]?.count || 0;
}

// Record coupon usage
export async function recordCouponUsage(db: DB, data: {
  couponId: string;
  purchaseId: string;
  userId?: string | null;
  email: string;
  discountApplied: number;
}) {
  const result = await db.insert(couponUsages).values({
    couponId: data.couponId,
    purchaseId: data.purchaseId,
    userId: data.userId,
    email: data.email.toLowerCase(),
    discountApplied: data.discountApplied,
  }).returning();
  return result[0];
}

// Validate coupon and calculate discount
export async function validateCoupon(
  db: DB,
  code: string,
  productId: string,
  email: string,
  amount: number // Product price in cents
): Promise<{
  valid: boolean;
  error?: string;
  coupon?: typeof coupons.$inferSelect;
  discount?: number;
  finalAmount?: number;
}> {
  // 1. Find coupon by code
  const coupon = await getCouponByCode(db, code);
  if (!coupon) {
    return { valid: false, error: 'Cupón no encontrado' };
  }

  // 2. Check if active
  if (!coupon.isActive) {
    return { valid: false, error: 'Este cupón no está activo' };
  }

  // 3. Check dates
  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return { valid: false, error: 'Este cupón aún no está disponible' };
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    return { valid: false, error: 'Este cupón ha expirado' };
  }

  // 4. Check total usage limit
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: 'Este cupón ha alcanzado su límite de usos' };
  }

  // 5. Check per-user usage limit
  if (coupon.usageLimitPerUser !== null) {
    const userUsageCount = await getCouponUsageCountByEmail(db, coupon.id, email);
    if (userUsageCount >= coupon.usageLimitPerUser) {
      return { valid: false, error: 'Ya has usado este cupón el máximo de veces permitido' };
    }
  }

  // 6. Check minimum purchase amount
  if (coupon.minPurchaseAmount !== null && amount < coupon.minPurchaseAmount) {
    const minFormatted = (coupon.minPurchaseAmount / 100).toFixed(2);
    return { valid: false, error: `El monto mínimo de compra es $${minFormatted}` };
  }

  // 7. Check allowed products
  if (coupon.productIds) {
    try {
      const allowedProducts = JSON.parse(coupon.productIds) as string[];
      if (!allowedProducts.includes(productId)) {
        return { valid: false, error: 'Este cupón no aplica para este producto' };
      }
    } catch {
      // If parsing fails, assume all products are allowed
    }
  }

  // 8. Calculate discount
  let discount: number;
  if (coupon.discountType === 'percentage') {
    discount = Math.floor(amount * (coupon.discountValue / 100));
  } else {
    discount = coupon.discountValue;
  }

  // 9. Apply max discount cap
  if (coupon.maxDiscountAmount !== null && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }

  // Ensure discount doesn't exceed the amount
  if (discount > amount) {
    discount = amount;
  }

  const finalAmount = amount - discount;

  return {
    valid: true,
    coupon,
    discount,
    finalAmount,
  };
}
