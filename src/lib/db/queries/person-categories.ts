import { eq, asc } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { personCategories } from '@/db/schema';

export type PersonCategory = typeof personCategories.$inferSelect;

// Get all person categories
export async function getAllPersonCategories(db: DbClient, onlyActive = true) {
  if (onlyActive) {
    return db
      .select()
      .from(personCategories)
      .where(eq(personCategories.isActive, true))
      .orderBy(asc(personCategories.order));
  }

  return db
    .select()
    .from(personCategories)
    .orderBy(asc(personCategories.order));
}

// Get person category by ID
export async function getPersonCategoryById(db: DbClient, id: string) {
  const [category] = await db
    .select()
    .from(personCategories)
    .where(eq(personCategories.id, id))
    .limit(1);
  return category || null;
}

// Get person category by slug
export async function getPersonCategoryBySlug(db: DbClient, slug: string) {
  const [category] = await db
    .select()
    .from(personCategories)
    .where(eq(personCategories.slug, slug))
    .limit(1);
  return category || null;
}

// Create person category
export async function createPersonCategory(
  db: DbClient,
  data: {
    name: string;
    slug: string;
    description?: string | null;
    order?: number;
    isActive?: boolean;
  }
) {
  const [category] = await db
    .insert(personCategories)
    .values(data)
    .returning();
  return category;
}

// Update person category
export async function updatePersonCategory(
  db: DbClient,
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    order: number;
    isActive: boolean;
  }>
) {
  const [category] = await db
    .update(personCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(personCategories.id, id))
    .returning();
  return category || null;
}

// Delete person category
export async function deletePersonCategory(db: DbClient, id: string) {
  await db.delete(personCategories).where(eq(personCategories.id, id));
}

// Toggle person category active status
export async function togglePersonCategoryActive(db: DbClient, id: string) {
  const category = await getPersonCategoryById(db, id);
  if (!category) return null;

  const [updated] = await db
    .update(personCategories)
    .set({ isActive: !category.isActive, updatedAt: new Date() })
    .where(eq(personCategories.id, id))
    .returning();
  return updated;
}
