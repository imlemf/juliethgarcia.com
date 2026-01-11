import { eq } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { downloadLinks } from '@/db/schema';

export async function getDownloadLinkByToken(db: DbClient, token: string) {
  return db.query.downloadLinks.findFirst({
    where: eq(downloadLinks.token, token),
    with: {
      purchase: {
        with: {
          product: true,
          user: true,
        },
      },
      product: true,
      user: true,
    },
  });
}

export async function createDownloadLink(
  db: DbClient,
  data: {
    purchaseId: string;
    productId: string;
    token: string;
    expiresAt: Date;
    userId?: string;
    maxDownloads?: number;
  }
) {
  const [downloadLink] = await db.insert(downloadLinks).values(data).returning();
  return downloadLink;
}

export async function updateDownloadLink(
  db: DbClient,
  id: string,
  data: Partial<{
    userId: string;
    firstDownloadCompleted: boolean;
    firstDownloadAt: Date;
    downloadCount: number;
    lastDownloadedAt: Date;
    ipAddress: string;
    userAgent: string;
  }>
) {
  const [downloadLink] = await db
    .update(downloadLinks)
    .set(data)
    .where(eq(downloadLinks.id, id))
    .returning();

  return downloadLink;
}
