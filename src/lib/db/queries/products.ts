import { eq, desc } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { products } from '@/db/schema';

export async function getAllProducts(db: DbClient, onlyActive = true) {
  if (onlyActive) {
    return db.query.products.findMany({
      where: eq(products.isActive, true),
      orderBy: [desc(products.createdAt)],
    });
  }

  return db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
  });
}

export async function getProductById(db: DbClient, id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
  });
}

export async function getProductBySlug(db: DbClient, slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
  });
}

export async function createProduct(
  db: DbClient,
  data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    currency?: string;
    imageUrl?: string | null;
    fileKey: string;
    fileName: string;
    fileSize?: number;
  }
) {
  const [product] = await db
    .insert(products)
    .values({
      ...data,
      description: data.description || '',
    })
    .returning();
  return product;
}

export async function updateProduct(
  db: DbClient,
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    imageUrl: string | null;
    fileKey: string;
    fileName: string;
    fileSize: number;
    isActive: boolean;
  }>
) {
  const [product] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();

  return product;
}

export async function deleteProduct(db: DbClient, id: string) {
  await db.delete(products).where(eq(products.id, id));
}
