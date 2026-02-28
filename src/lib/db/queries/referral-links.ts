import { eq, desc, asc, and, sql } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { referralLinks, referralCategories, referralClicks } from '@/db/schema';
import type { CreateReferralLinkInput, UpdateReferralLinkInput } from '@/lib/validations/referral';

export async function getAllReferralLinks(db: DbClient, onlyActive = false) {
  const conditions = onlyActive ? [eq(referralLinks.isActive, true)] : [];

  return db.select({
    id: referralLinks.id,
    title: referralLinks.title,
    slug: referralLinks.slug,
    description: referralLinks.description,
    destinationUrl: referralLinks.destinationUrl,
    image: referralLinks.image,
    categoryId: referralLinks.categoryId,
    categoryName: referralCategories.name,
    utmSource: referralLinks.utmSource,
    utmMedium: referralLinks.utmMedium,
    utmCampaign: referralLinks.utmCampaign,
    utmTerm: referralLinks.utmTerm,
    utmContent: referralLinks.utmContent,
    clickCount: referralLinks.clickCount,
    lastClickAt: referralLinks.lastClickAt,
    order: referralLinks.order,
    isActive: referralLinks.isActive,
    createdAt: referralLinks.createdAt,
  })
    .from(referralLinks)
    .leftJoin(referralCategories, eq(referralLinks.categoryId, referralCategories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(referralLinks.order), desc(referralLinks.createdAt));
}

export async function getReferralLinkById(db: DbClient, id: string) {
  const [link] = await db.select().from(referralLinks)
    .where(eq(referralLinks.id, id)).limit(1);
  return link || null;
}

export async function getReferralLinkBySlug(db: DbClient, slug: string) {
  const [link] = await db.select().from(referralLinks)
    .where(eq(referralLinks.slug, slug)).limit(1);
  return link || null;
}

export async function createReferralLink(db: DbClient, data: CreateReferralLinkInput) {
  const [link] = await db.insert(referralLinks).values({
    title: data.title,
    slug: data.slug,
    description: data.description,
    destinationUrl: data.destinationUrl,
    image: data.image || null,
    categoryId: data.categoryId || null,
    utmSource: data.utmSource || null,
    utmMedium: data.utmMedium || null,
    utmCampaign: data.utmCampaign || null,
    utmTerm: data.utmTerm || null,
    utmContent: data.utmContent || null,
    order: data.order ?? 0,
    isActive: data.isActive ?? true,
  }).returning();
  return link;
}

export async function updateReferralLink(db: DbClient, id: string, data: UpdateReferralLinkInput) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.destinationUrl !== undefined) updateData.destinationUrl = data.destinationUrl;
  if (data.image !== undefined) updateData.image = data.image || null;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
  if (data.utmSource !== undefined) updateData.utmSource = data.utmSource || null;
  if (data.utmMedium !== undefined) updateData.utmMedium = data.utmMedium || null;
  if (data.utmCampaign !== undefined) updateData.utmCampaign = data.utmCampaign || null;
  if (data.utmTerm !== undefined) updateData.utmTerm = data.utmTerm || null;
  if (data.utmContent !== undefined) updateData.utmContent = data.utmContent || null;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const [link] = await db.update(referralLinks)
    .set(updateData)
    .where(eq(referralLinks.id, id))
    .returning();
  return link;
}

export async function deleteReferralLink(db: DbClient, id: string) {
  await db.delete(referralLinks).where(eq(referralLinks.id, id));
}

// Click tracking
export async function trackClick(
  db: DbClient,
  linkId: string,
  clickData: {
    country?: string;
    userAgent?: string;
    referer?: string;
    ipAddress?: string;
    incomingUtmSource?: string;
    incomingUtmMedium?: string;
    incomingUtmCampaign?: string;
  }
) {
  // Insert detailed click record
  await db.insert(referralClicks).values({
    linkId,
    country: clickData.country || null,
    userAgent: clickData.userAgent || null,
    referer: clickData.referer || null,
    ipAddress: clickData.ipAddress || null,
    incomingUtmSource: clickData.incomingUtmSource || null,
    incomingUtmMedium: clickData.incomingUtmMedium || null,
    incomingUtmCampaign: clickData.incomingUtmCampaign || null,
  });

  // Update aggregate stats on link
  await db.update(referralLinks)
    .set({
      clickCount: sql`${referralLinks.clickCount} + 1`,
      lastClickAt: new Date(),
    })
    .where(eq(referralLinks.id, linkId));
}

// Analytics queries
export async function getClickStats(db: DbClient, linkId: string) {
  // Get click counts by country
  const byCountry = await db.select({
    country: referralClicks.country,
    count: sql<number>`count(*)`.as('count'),
  })
    .from(referralClicks)
    .where(eq(referralClicks.linkId, linkId))
    .groupBy(referralClicks.country)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  // Get recent clicks
  const recentClicks = await db.select()
    .from(referralClicks)
    .where(eq(referralClicks.linkId, linkId))
    .orderBy(desc(referralClicks.clickedAt))
    .limit(20);

  // Get total clicks
  const link = await getReferralLinkById(db, linkId);

  return {
    totalClicks: link?.clickCount ?? 0,
    lastClickAt: link?.lastClickAt,
    byCountry,
    recentClicks,
  };
}
