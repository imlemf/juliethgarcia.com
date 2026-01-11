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

export async function getPurchaseByPaymentId(db: DbClient, mpPaymentId: string) {
  return db.query.purchases.findFirst({
    where: eq(purchases.mpPaymentId, mpPaymentId),
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
    mpPaymentId?: string;
    mpOrderId?: string;
    mpStatus?: string;
    mpStatusDetail?: string;
    amount: number;
    currency: string;
    status?: 'pending' | 'completed' | 'refunded' | 'failed';
    userId?: string;
  }
) {
  const [purchase] = await db.insert(purchases).values(data).returning();
  return purchase;
}

export async function updatePurchase(
  db: DbClient,
  id: string,
  data: Partial<{
    userId: string;
    mpPaymentId: string;
    mpOrderId: string;
    mpStatus: string;
    mpStatusDetail: string;
    status: 'pending' | 'completed' | 'refunded' | 'failed';
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
