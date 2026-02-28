import { eq, and, desc, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { offers, offerUsages } from '@/db/schema';

type DB = DrizzleD1Database<Record<string, never>>;

// Maximum number of active offers allowed at the same time
export const MAX_ACTIVE_OFFERS = 5;

// Count currently active offers (considering null dates as always active)
export async function countActiveOffers(db: DB, excludeId?: string): Promise<number> {
  const now = new Date();
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(and(
      eq(offers.isActive, true),
      sql`(${offers.startsAt} IS NULL OR ${offers.startsAt} <= ${now.getTime()})`,
      sql`(${offers.expiresAt} IS NULL OR ${offers.expiresAt} >= ${now.getTime()})`,
      excludeId ? sql`${offers.id} != ${excludeId}` : undefined
    ));
  return result[0]?.count ?? 0;
}

// Check if we can activate an offer (respects max limit)
export async function canActivateOffer(db: DB, excludeId?: string): Promise<boolean> {
  const count = await countActiveOffers(db, excludeId);
  return count < MAX_ACTIVE_OFFERS;
}

export async function getAllOffers(db: DB) {
  return db.select().from(offers).orderBy(desc(offers.createdAt));
}

export async function getOfferById(db: DB, id: string) {
  const result = await db.select().from(offers).where(eq(offers.id, id));
  return result[0] || null;
}

export async function createOffer(db: DB, data: {
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
  const result = await db.insert(offers).values({
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

export async function updateOffer(db: DB, id: string, data: Partial<{
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
  const result = await db.update(offers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(offers.id, id))
    .returning();
  return result[0];
}

export async function deleteOffer(db: DB, id: string) {
  await db.delete(offers).where(eq(offers.id, id));
}

// Get user's offer usage count
export async function getUserOfferUsageCount(db: DB, offerId: string, email: string): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(offerUsages)
    .where(and(
      eq(offerUsages.offerId, offerId),
      eq(offerUsages.email, email)
    ));
  return result[0]?.count ?? 0;
}

// Calculate discount for an offer
function calculateOfferDiscount(
  offer: typeof offers.$inferSelect,
  amount: number
): number {
  let discount: number;
  if (offer.discountType === 'percentage') {
    discount = Math.floor(amount * (offer.discountValue / 100));
  } else {
    discount = offer.discountValue;
  }

  // Apply max discount cap
  if (offer.maxDiscountAmount !== null && discount > offer.maxDiscountAmount) {
    discount = offer.maxDiscountAmount;
  }

  // Ensure discount doesn't exceed the amount
  if (discount > amount) {
    discount = amount;
  }

  return discount;
}

// Get the best active offer for a product (the one with highest discount)
export async function getActiveOfferForProduct(
  db: DB,
  productId: string,
  amount: number, // Product price in cents
  email?: string // Optional email for per-user limit check
): Promise<{
  offer: typeof offers.$inferSelect | null;
  discount: number;
  finalAmount: number;
}> {
  const now = new Date();

  // Get all active offers that are currently valid (null dates = always active)
  const activeOffers = await db.select()
    .from(offers)
    .where(and(
      eq(offers.isActive, true),
      sql`(${offers.startsAt} IS NULL OR ${offers.startsAt} <= ${now.getTime()})`,
      sql`(${offers.expiresAt} IS NULL OR ${offers.expiresAt} >= ${now.getTime()})`
    ));

  // Find all applicable offers and calculate their discounts
  const applicableOffers: Array<{
    offer: typeof offers.$inferSelect;
    discount: number;
  }> = [];

  for (const offer of activeOffers) {
    // Check total usage limit
    if (offer.usageLimit !== null && offer.usageCount >= offer.usageLimit) {
      continue;
    }

    // Check per-user usage limit
    if (offer.usageLimitPerUser !== null && email) {
      const userUsageCount = await getUserOfferUsageCount(db, offer.id, email);
      if (userUsageCount >= offer.usageLimitPerUser) {
        continue;
      }
    }

    // Check minimum purchase amount
    if (offer.minPurchaseAmount !== null && amount < offer.minPurchaseAmount) {
      continue;
    }

    // Check if product is allowed
    if (offer.productIds) {
      try {
        const allowedProducts = JSON.parse(offer.productIds) as string[];
        if (!allowedProducts.includes(productId)) {
          continue;
        }
      } catch {
        // If parsing fails, assume all products are allowed
      }
    }

    // Calculate discount for this offer
    const discount = calculateOfferDiscount(offer, amount);
    applicableOffers.push({ offer, discount });
  }

  // No applicable offers found
  if (applicableOffers.length === 0) {
    return {
      offer: null,
      discount: 0,
      finalAmount: amount,
    };
  }

  // Find the offer with the highest discount (best for user)
  const bestOffer = applicableOffers.reduce((best, current) => {
    if (current.discount > best.discount) {
      return current;
    }
    return best;
  });

  return {
    offer: bestOffer.offer,
    discount: bestOffer.discount,
    finalAmount: amount - bestOffer.discount,
  };
}

// Increment offer usage count
export async function incrementOfferUsage(db: DB, offerId: string) {
  await db.update(offers)
    .set({ usageCount: sql`${offers.usageCount} + 1` })
    .where(eq(offers.id, offerId));
}

// Record offer usage
export async function recordOfferUsage(db: DB, data: {
  offerId: string;
  purchaseId: string;
  userId?: string;
  email: string;
  discountApplied: number;
}) {
  const result = await db.insert(offerUsages).values({
    offerId: data.offerId,
    purchaseId: data.purchaseId,
    userId: data.userId,
    email: data.email,
    discountApplied: data.discountApplied,
  }).returning();
  return result[0];
}
