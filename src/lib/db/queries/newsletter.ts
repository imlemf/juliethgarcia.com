import { eq } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { newsletterSubscribers } from '@/db/schema';

export async function getSubscriberByEmail(db: DbClient, email: string) {
  return db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.email, email.toLowerCase()),
  });
}

export async function getAllActiveSubscribers(db: DbClient) {
  return db.query.newsletterSubscribers.findMany({
    where: eq(newsletterSubscribers.status, 'active'),
  });
}

export async function subscribeToNewsletter(
  db: DbClient,
  data: {
    email: string;
    name?: string;
    phone?: string;
    countryCode?: 'CO' | 'US' | 'MX';
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<{ subscriber: typeof newsletterSubscribers.$inferSelect; created: boolean }> {
  const normalizedEmail = data.email.toLowerCase().trim();
  const normalizedPhone = data.phone?.replace(/\D/g, '') || null;

  // Check if already exists
  const existing = await getSubscriberByEmail(db, normalizedEmail);

  if (existing) {
    // If unsubscribed, resubscribe
    if (existing.status === 'unsubscribed') {
      const [updated] = await db
        .update(newsletterSubscribers)
        .set({
          status: 'active',
          createdAt: new Date(),
          uncreatedAt: null,
          name: data.name,
          phone: normalizedPhone,
          countryCode: data.countryCode,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        })
        .where(eq(newsletterSubscribers.id, existing.id))
        .returning();
      return { subscriber: updated, created: false };
    }
    // Already subscribed - update phone/name if provided
    if (normalizedPhone && data.countryCode || data.name) {
      const [updated] = await db
        .update(newsletterSubscribers)
        .set({
          ...(data.name && { name: data.name }),
          ...(normalizedPhone && data.countryCode && { phone: normalizedPhone, countryCode: data.countryCode }),
        })
        .where(eq(newsletterSubscribers.id, existing.id))
        .returning();
      return { subscriber: updated, created: false };
    }
    return { subscriber: existing, created: false };
  }

  // Create new subscriber
  const [subscriber] = await db
    .insert(newsletterSubscribers)
    .values({
      email: normalizedEmail,
      name: data.name,
      phone: normalizedPhone,
      countryCode: data.countryCode,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    .returning();

  return { subscriber, created: true };
}

export async function unsubscribeFromNewsletter(db: DbClient, email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const [updated] = await db
    .update(newsletterSubscribers)
    .set({
      status: 'unsubscribed',
      uncreatedAt: new Date(),
    })
    .where(eq(newsletterSubscribers.email, normalizedEmail))
    .returning();

  return updated;
}
