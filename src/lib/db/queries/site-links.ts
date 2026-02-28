import { eq, desc, asc, and } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { siteLinks } from '@/db/schema';

// GET - List all links ordered by order field (using direct query builder for D1 stub compatibility)
export async function getAllSiteLinks(db: DbClient, onlyActive = true) {
  if (onlyActive) {
    return db
      .select()
      .from(siteLinks)
      .where(eq(siteLinks.isActive, true))
      .orderBy(asc(siteLinks.order), desc(siteLinks.createdAt));
  }
  return db
    .select()
    .from(siteLinks)
    .orderBy(asc(siteLinks.order), desc(siteLinks.createdAt));
}

// GET - Single link by ID (using direct query builder for D1 stub compatibility)
export async function getSiteLinkById(db: DbClient, id: string) {
  const [link] = await db
    .select()
    .from(siteLinks)
    .where(eq(siteLinks.id, id))
    .limit(1);
  return link || null;
}

// POST - Create new link
export async function createSiteLink(
  db: DbClient,
  data: {
    title: string;
    url: string;
    icon: string;
    iconType: 'emoji' | 'lucide';
    linkType: 'social' | 'custom';
    order?: number;
    isActive?: boolean;
  }
) {
  const [link] = await db
    .insert(siteLinks)
    .values(data)
    .returning();
  return link;
}

// PATCH - Update link
export async function updateSiteLink(
  db: DbClient,
  id: string,
  data: Partial<{
    title: string;
    url: string;
    icon: string;
    iconType: 'emoji' | 'lucide';
    linkType: 'social' | 'custom';
    order: number;
    isActive: boolean;
  }>
) {
  const [link] = await db
    .update(siteLinks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(siteLinks.id, id))
    .returning();
  return link;
}

// DELETE - Remove link
export async function deleteSiteLink(db: DbClient, id: string) {
  await db.delete(siteLinks).where(eq(siteLinks.id, id));
}

// PUT - Bulk reorder links (for drag-and-drop)
export async function reorderSiteLinks(
  db: DbClient,
  linkOrders: { id: string; order: number }[]
) {
  // Batch update orders
  const promises = linkOrders.map(({ id, order }) =>
    db
      .update(siteLinks)
      .set({ order, updatedAt: new Date() })
      .where(eq(siteLinks.id, id))
  );
  await Promise.all(promises);
}

// PATCH - Increment click count (analytics)
export async function incrementClickCount(db: DbClient, id: string) {
  const link = await getSiteLinkById(db, id);
  if (link) {
    await db
      .update(siteLinks)
      .set({ clickCount: link.clickCount + 1 })
      .where(eq(siteLinks.id, id));
  }
}
