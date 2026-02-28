import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { purchases, products, users, downloadLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
  }

  const db = getDb(locals.runtime);

  const [purchase] = await db
    .select({
      id: purchases.id,
      email: purchases.email,
      purchaseCode: purchases.purchaseCode,
      amount: purchases.amount,
      currency: purchases.currency,
      status: purchases.status,
      paymentProvider: purchases.paymentProvider,
      externalPaymentId: purchases.externalPaymentId,
      externalOrderId: purchases.externalOrderId,
      providerStatus: purchases.providerStatus,
      providerStatusDetail: purchases.providerStatusDetail,
      checkoutUrl: purchases.checkoutUrl,
      usedForRegistration: purchases.usedForRegistration,
      registrationUsedAt: purchases.registrationUsedAt,
      createdAt: purchases.createdAt,
      updatedAt: purchases.updatedAt,
      productId: purchases.productId,
      productName: products.name,
      productSlug: products.slug,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(purchases)
    .leftJoin(products, eq(purchases.productId, products.id))
    .leftJoin(users, eq(purchases.userId, users.id))
    .where(eq(purchases.id, id))
    .limit(1);

  if (!purchase) {
    return new Response(JSON.stringify({ error: 'Compra no encontrada' }), { status: 404 });
  }

  // Get download links for this purchase
  const links = await db
    .select({
      id: downloadLinks.id,
      token: downloadLinks.token,
      downloadCount: downloadLinks.downloadCount,
      maxDownloads: downloadLinks.maxDownloads,
      expiresAt: downloadLinks.expiresAt,
      createdAt: downloadLinks.createdAt,
    })
    .from(downloadLinks)
    .where(eq(downloadLinks.purchaseId, id));

  return new Response(JSON.stringify({ purchase, downloadLinks: links }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
