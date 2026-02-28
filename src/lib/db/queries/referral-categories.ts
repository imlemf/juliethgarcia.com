import { eq, asc, count } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { referralCategories } from '@/db/schema';
import type { CreateReferralCategoryInput, UpdateReferralCategoryInput } from '@/lib/validations/referral';

const MAX_CATEGORIES = 10;

export async function getAllReferralCategories(db: DbClient, onlyActive = false) {
  if (onlyActive) {
    return db.select().from(referralCategories)
      .where(eq(referralCategories.isActive, true))
      .orderBy(asc(referralCategories.order), asc(referralCategories.name));
  }
  return db.select().from(referralCategories)
    .orderBy(asc(referralCategories.order), asc(referralCategories.name));
}

export async function getReferralCategoryById(db: DbClient, id: string) {
  const [category] = await db.select().from(referralCategories)
    .where(eq(referralCategories.id, id)).limit(1);
  return category || null;
}

export async function getReferralCategoryBySlug(db: DbClient, slug: string) {
  const [category] = await db.select().from(referralCategories)
    .where(eq(referralCategories.slug, slug)).limit(1);
  return category || null;
}

export async function getCategoryCount(db: DbClient) {
  const [result] = await db.select({ count: count() }).from(referralCategories);
  return result?.count ?? 0;
}

export async function canCreateCategory(db: DbClient) {
  const currentCount = await getCategoryCount(db);
  return currentCount < MAX_CATEGORIES;
}

export async function createReferralCategory(db: DbClient, data: CreateReferralCategoryInput) {
  const [category] = await db.insert(referralCategories).values({
    name: data.name,
    slug: data.slug,
    description: data.description,
    order: data.order ?? 0,
    isActive: data.isActive ?? true,
  }).returning();
  return category;
}

export async function updateReferralCategory(db: DbClient, id: string, data: UpdateReferralCategoryInput) {
  const [category] = await db.update(referralCategories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(referralCategories.id, id))
    .returning();
  return category;
}

export async function deleteReferralCategory(db: DbClient, id: string) {
  await db.delete(referralCategories).where(eq(referralCategories.id, id));
}
