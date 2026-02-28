import { eq, asc } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { personTitles } from '@/db/schema';

export type PersonTitle = typeof personTitles.$inferSelect;

// Get all person titles
export async function getAllPersonTitles(db: DbClient, onlyActive = true) {
  if (onlyActive) {
    return db
      .select()
      .from(personTitles)
      .where(eq(personTitles.isActive, true))
      .orderBy(asc(personTitles.order));
  }

  return db
    .select()
    .from(personTitles)
    .orderBy(asc(personTitles.order));
}

// Get person title by ID
export async function getPersonTitleById(db: DbClient, id: string) {
  const [title] = await db
    .select()
    .from(personTitles)
    .where(eq(personTitles.id, id))
    .limit(1);
  return title || null;
}

// Get person title by slug
export async function getPersonTitleBySlug(db: DbClient, slug: string) {
  const [title] = await db
    .select()
    .from(personTitles)
    .where(eq(personTitles.slug, slug))
    .limit(1);
  return title || null;
}

// Create person title
export async function createPersonTitle(
  db: DbClient,
  data: {
    name: string;
    slug: string;
    order?: number;
    isActive?: boolean;
  }
) {
  const [title] = await db
    .insert(personTitles)
    .values(data)
    .returning();
  return title;
}

// Update person title
export async function updatePersonTitle(
  db: DbClient,
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    order: number;
    isActive: boolean;
  }>
) {
  const [title] = await db
    .update(personTitles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(personTitles.id, id))
    .returning();
  return title || null;
}

// Delete person title
export async function deletePersonTitle(db: DbClient, id: string) {
  await db.delete(personTitles).where(eq(personTitles.id, id));
}

// Toggle person title active status
export async function togglePersonTitleActive(db: DbClient, id: string) {
  const title = await getPersonTitleById(db, id);
  if (!title) return null;

  const [updated] = await db
    .update(personTitles)
    .set({ isActive: !title.isActive, updatedAt: new Date() })
    .where(eq(personTitles.id, id))
    .returning();
  return updated;
}
