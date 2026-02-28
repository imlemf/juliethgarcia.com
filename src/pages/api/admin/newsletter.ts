import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { newsletterSubscribers } from '@/db/schema';
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
  if (statusFilter && (statusFilter === 'active' || statusFilter === 'unsubscribed')) {
    conditions.push(eq(newsletterSubscribers.status, statusFilter));
  }
  if (emailFilter) {
    conditions.push(like(newsletterSubscribers.email, `%${emailFilter}%`));
  }

  const subscribers = await db
    .select({
      id: newsletterSubscribers.id,
      email: newsletterSubscribers.email,
      name: newsletterSubscribers.name,
      phone: newsletterSubscribers.phone,
      countryCode: newsletterSubscribers.countryCode,
      status: newsletterSubscribers.status,
      createdAt: newsletterSubscribers.createdAt,
      uncreatedAt: newsletterSubscribers.uncreatedAt,
    })
    .from(newsletterSubscribers)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(newsletterSubscribers.createdAt));

  return new Response(JSON.stringify({ subscribers }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
