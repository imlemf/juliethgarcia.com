import { eq, desc, or } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { purchases } from '@/db/schema';

export async function getAllPurchases(db: DbClient) {
  return db.query.purchases.findMany({
    orderBy: [desc(purchases.createdAt)],
    with: {
      product: true,
      user: true,
    },
  });
}

export async function getPurchaseById(db: DbClient, id: string) {
  return db.query.purchases.findFirst({
    where: eq(purchases.id, id),
    with: {
      product: true,
      user: true,
      downloadLinks: true,
    },
  });
}

export async function getPurchaseByCode(db: DbClient, code: string) {
  return db.query.purchases.findFirst({
    where: eq(purchases.purchaseCode, code),
    with: {
      product: true,
      user: true,
    },
  });
}

export async function getPurchaseByPaymentId(db: DbClient, externalPaymentId: string) {
  return db.query.purchases.findFirst({
    where: eq(purchases.externalPaymentId, externalPaymentId),
    with: {
      product: true,
    },
  });
}

export async function getPurchasesByUserId(db: DbClient, userId: string) {
  return db.query.purchases.findMany({
    where: eq(purchases.userId, userId),
    orderBy: [desc(purchases.createdAt)],
    with: {
      product: true,
      downloadLinks: true,
    },
  });
}

export async function getPurchasesByUserIdOrEmail(db: DbClient, userId: string, email: string) {
  return db.query.purchases.findMany({
    where: or(
      eq(purchases.userId, userId),
      eq(purchases.email, email)
    ),
    orderBy: [desc(purchases.createdAt)],
    with: {
      product: true,
      downloadLinks: true,
    },
  });
}

export async function createPurchase(
  db: DbClient,
  data: {
    productId: string;
    email: string;
    purchaseCode: string;
    paymentProvider?: string;
    externalPaymentId?: string;
    externalOrderId?: string;
    providerStatus?: string;
    providerStatusDetail?: string;
    checkoutUrl?: string;
    amount: number;
    currency: string;
    status?: 'initialized' | 'pending' | 'completed' | 'refunded' | 'failed';
    userId?: string;
  }
) {
  const [purchase] = await db.insert(purchases).values(data).returning();
  return purchase;
}

/**
 * Creates a purchase with 'initialized' status when payment link is generated.
 * This tracks the purchase from the moment the checkout link is created.
 */
export async function createInitializedPurchase(
  db: DbClient,
  data: {
    productId: string;
    email: string;
    purchaseCode: string;
    paymentProvider: string;
    checkoutUrl: string;
    amount: number;
    currency: string;
    // Discount fields
    couponId?: string;
    offerId?: string;
    discountSource?: 'coupon' | 'offer';
    discountAmount?: number;
    originalAmount?: number;
  }
) {
  const [purchase] = await db.insert(purchases).values({
    ...data,
    status: 'initialized',
  }).returning();
  return purchase;
}

/**
 * Creates a purchase idempotently.
 * If a purchase with the same externalPaymentId exists, returns the existing one.
 * Handles race conditions using UNIQUE constraint + try/catch.
 */
export async function getOrCreatePurchase(
  db: DbClient,
  data: {
    productId: string;
    email: string;
    purchaseCode: string;
    paymentProvider: string;
    externalPaymentId: string;
    externalOrderId?: string;
    providerStatus?: string;
    providerStatusDetail?: string;
    amount: number;
    currency: string;
    status?: 'initialized' | 'pending' | 'completed' | 'refunded' | 'failed';
    userId?: string;
  }
): Promise<{ purchase: typeof purchases.$inferSelect; created: boolean }> {
  // First try to insert
  try {
    const [purchase] = await db.insert(purchases).values(data).returning();
    return { purchase, created: true };
  } catch (error: any) {
    // If fails due to UNIQUE constraint, find the existing one
    if (error?.message?.includes('UNIQUE constraint failed') ||
        error?.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        error?.code === '23505') { // PostgreSQL unique violation
      const existing = await getPurchaseByPaymentId(db, data.externalPaymentId);
      if (existing) {
        return { purchase: existing, created: false };
      }
    }
    // If other error, re-throw
    throw error;
  }
}

export async function updatePurchase(
  db: DbClient,
  id: string,
  data: Partial<{
    userId: string;
    paymentProvider: string;
    externalPaymentId: string;
    externalOrderId: string;
    providerStatus: string;
    providerStatusDetail: string;
    checkoutUrl: string;
    status: 'initialized' | 'pending' | 'completed' | 'refunded' | 'failed';
    usedForRegistration: boolean;
    registrationUsedAt: Date;
  }>
) {
  const [purchase] = await db
    .update(purchases)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(purchases.id, id))
    .returning();

  return purchase;
}
