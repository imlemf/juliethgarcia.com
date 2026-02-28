import { eq, desc, and, isNull } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { blogs, blogCategories } from '@/db/schema';

export async function getAllBlogs(db: DbClient, onlyPublished = true) {
  if (onlyPublished) {
    return db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        excerpt: blogs.excerpt,
        content: blogs.content,
        coverImage: blogs.coverImage,
        categoryId: blogs.categoryId,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        isPublished: blogs.isPublished,
        isPremium: blogs.isPremium,
        publishedAt: blogs.publishedAt,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
      })
      .from(blogs)
      .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
      .where(eq(blogs.isPublished, true))
      .orderBy(desc(blogs.publishedAt));
  }

  return db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      content: blogs.content,
      coverImage: blogs.coverImage,
      categoryId: blogs.categoryId,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      isPublished: blogs.isPublished,
      isPremium: blogs.isPremium,
      publishedAt: blogs.publishedAt,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
    })
    .from(blogs)
    .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
    .orderBy(desc(blogs.createdAt));
}

export async function getBlogsByCategory(db: DbClient, categoryId: string, onlyPublished = true) {
  const conditions = [eq(blogs.categoryId, categoryId)];
  if (onlyPublished) {
    conditions.push(eq(blogs.isPublished, true));
  }

  return db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      content: blogs.content,
      coverImage: blogs.coverImage,
      categoryId: blogs.categoryId,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      isPublished: blogs.isPublished,
      isPremium: blogs.isPremium,
      publishedAt: blogs.publishedAt,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
    })
    .from(blogs)
    .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
    .where(and(...conditions))
    .orderBy(desc(blogs.publishedAt));
}

export async function getBlogById(db: DbClient, id: string) {
  const [blog] = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      content: blogs.content,
      coverImage: blogs.coverImage,
      categoryId: blogs.categoryId,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      isPublished: blogs.isPublished,
      isPremium: blogs.isPremium,
      publishedAt: blogs.publishedAt,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
    })
    .from(blogs)
    .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
    .where(eq(blogs.id, id))
    .limit(1);
  return blog || null;
}

export async function getBlogBySlug(db: DbClient, slug: string, onlyPublished = true) {
  const conditions = [eq(blogs.slug, slug)];
  if (onlyPublished) {
    conditions.push(eq(blogs.isPublished, true));
  }

  const [blog] = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      content: blogs.content,
      coverImage: blogs.coverImage,
      categoryId: blogs.categoryId,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
      isPublished: blogs.isPublished,
      isPremium: blogs.isPremium,
      publishedAt: blogs.publishedAt,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
    })
    .from(blogs)
    .leftJoin(blogCategories, eq(blogs.categoryId, blogCategories.id))
    .where(and(...conditions))
    .limit(1);
  return blog || null;
}

export async function createBlog(
  db: DbClient,
  data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    categoryId?: string;
    isPublished?: boolean;
    isPremium?: boolean;
  }
) {
  const publishedAt = data.isPublished ? new Date() : null;

  const [blog] = await db
    .insert(blogs)
    .values({
      ...data,
      publishedAt,
    })
    .returning();
  return blog;
}

export async function updateBlog(
  db: DbClient,
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    categoryId: string | null;
    isPublished: boolean;
    isPremium: boolean;
  }>
) {
  // Get current blog state to handle publishedAt
  const currentBlog = await getBlogById(db, id);

  let publishedAt = currentBlog?.publishedAt;
  if (data.isPublished !== undefined) {
    if (data.isPublished && !currentBlog?.isPublished) {
      // Publishing for the first time
      publishedAt = new Date();
    } else if (!data.isPublished) {
      // Unpublishing - keep the old publishedAt for reference
    }
  }

  const [blog] = await db
    .update(blogs)
    .set({
      ...data,
      publishedAt,
      updatedAt: new Date()
    })
    .where(eq(blogs.id, id))
    .returning();
  return blog;
}

export async function deleteBlog(db: DbClient, id: string) {
  await db.delete(blogs).where(eq(blogs.id, id));
}
