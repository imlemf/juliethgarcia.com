import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { purchases, products, users } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const statusFilter = url.searchParams.get('status');
  const emailFilter = url.searchParams.get('email');

  const db = getDb(locals.runtime);

  const conditions = [];
  if (statusFilter && ['initialized', 'pending', 'completed', 'refunded', 'failed'].includes(statusFilter)) {
    conditions.push(eq(purchases.status, statusFilter as 'initialized' | 'pending' | 'completed' | 'refunded' | 'failed'));
  }
  if (emailFilter) {
    conditions.push(like(purchases.email, `%${emailFilter}%`));
  }

  const allPurchases = await db
    .select({
      id: purchases.id,
      email: purchases.email,
      purchaseCode: purchases.purchaseCode,
      amount: purchases.amount,
      currency: purchases.currency,
      status: purchases.status,
      paymentProvider: purchases.paymentProvider,
      externalPaymentId: purchases.externalPaymentId,
      usedForRegistration: purchases.usedForRegistration,
      createdAt: purchases.createdAt,
      productName: products.name,
      productSlug: products.slug,
      userName: users.name,
      userId: users.id,
    })
    .from(purchases)
    .leftJoin(products, eq(purchases.productId, products.id))
    .leftJoin(users, eq(purchases.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(purchases.createdAt));

  return new Response(JSON.stringify({ purchases: allPurchases }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
