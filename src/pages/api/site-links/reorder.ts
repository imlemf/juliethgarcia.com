import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { reorderSiteLinks } from '@/lib/db/queries/site-links';
import { reorderSiteLinksSchema } from '@/lib/validations/site-links';

// PUT /api/site-links/reorder - Bulk reorder links (admin only)
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    const validationResult = reorderSiteLinksSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const db = getDb(locals.runtime);
    await reorderSiteLinks(db, validationResult.data.linkOrders);

    return new Response(JSON.stringify({ message: 'Links reordered successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reordering site links:', error);
    return new Response(JSON.stringify({ error: 'Failed to reorder site links' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
