import { eq, desc, asc } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { recipeCategories } from '@/db/schema';

export async function getAllRecipeCategories(db: DbClient, onlyActive = true) {
  if (onlyActive) {
    return db
      .select()
      .from(recipeCategories)
      .where(eq(recipeCategories.isActive, true))
      .orderBy(asc(recipeCategories.order), asc(recipeCategories.name));
  }

  return db
    .select()
    .from(recipeCategories)
    .orderBy(asc(recipeCategories.order), asc(recipeCategories.name));
}

export async function getRecipeCategoryById(db: DbClient, id: string) {
  const [category] = await db
    .select()
    .from(recipeCategories)
    .where(eq(recipeCategories.id, id))
    .limit(1);
  return category || null;
}

export async function getRecipeCategoryBySlug(db: DbClient, slug: string) {
  const [category] = await db
    .select()
    .from(recipeCategories)
    .where(eq(recipeCategories.slug, slug))
    .limit(1);
  return category || null;
}

export async function createRecipeCategory(
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
    .insert(recipeCategories)
    .values(data)
    .returning();
  return category;
}

export async function updateRecipeCategory(
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
    .update(recipeCategories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(recipeCategories.id, id))
    .returning();
  return category;
}

export async function deleteRecipeCategory(db: DbClient, id: string) {
  await db.delete(recipeCategories).where(eq(recipeCategories.id, id));
}
