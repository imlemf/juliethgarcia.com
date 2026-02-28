import { eq, asc, count } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { blogCategories } from '@/db/schema';

const MAX_CATEGORIES = 10;

export async function getAllBlogCategories(db: DbClient, onlyActive = false) {
  if (onlyActive) {
    return db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.isActive, true))
      .orderBy(asc(blogCategories.order), asc(blogCategories.name));
  }
  return db
    .select()
    .from(blogCategories)
    .orderBy(asc(blogCategories.order), asc(blogCategories.name));
}

export async function getBlogCategoryById(db: DbClient, id: string) {
  const [category] = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.id, id))
    .limit(1);
  return category || null;
}

export async function getBlogCategoryBySlug(db: DbClient, slug: string) {
  const [category] = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.slug, slug))
    .limit(1);
  return category || null;
}

export async function getCategoryCount(db: DbClient) {
  const [result] = await db
    .select({ count: count() })
    .from(blogCategories);
  return result?.count ?? 0;
}

export async function canCreateCategory(db: DbClient) {
  const currentCount = await getCategoryCount(db);
  return currentCount < MAX_CATEGORIES;
}

export async function createBlogCategory(
  db: DbClient,
  data: {
    name: string;
    slug: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  const canCreate = await canCreateCategory(db);
  if (!canCreate) {
    throw new Error(`No se pueden crear más de ${MAX_CATEGORIES} categorías`);
  }

  const [category] = await db
    .insert(blogCategories)
    .values(data)
    .returning();
  return category;
}

export async function updateBlogCategory(
  db: DbClient,
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    order: number;
    isActive: boolean;
  }>
) {
  const [category] = await db
    .update(blogCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(blogCategories.id, id))
    .returning();
  return category;
}

export async function deleteBlogCategory(db: DbClient, id: string) {
  await db.delete(blogCategories).where(eq(blogCategories.id, id));
}
