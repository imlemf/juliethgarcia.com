import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { downloadLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
  const db = getDb(locals.runtime);

  await db
    .update(downloadLinks)
    .set({ downloadCount: 0 })
    .where(eq(downloadLinks.token, 'pm2p4w6u5qrlno22otdc5p1m'));

  const result = await db
    .select({
      token: downloadLinks.token,
      downloadCount: downloadLinks.downloadCount,
    })
    .from(downloadLinks)
    .where(eq(downloadLinks.token, 'pm2p4w6u5qrlno22otdc5p1m'));

  return new Response(JSON.stringify({ ok: true, result }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
