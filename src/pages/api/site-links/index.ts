import type { APIRoute } from 'astro';
import { eq, count } from 'drizzle-orm';
import { getDb, siteLinks } from '@/lib/db';
import { getAllSiteLinks, createSiteLink } from '@/lib/db/queries/site-links';
import { createSiteLinkSchema } from '@/lib/validations/site-links';

const MAX_ACTIVE_LINKS = 10;

// GET /api/site-links - List all links (public for onlyActive, admin for all)
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const showInactive = url.searchParams.get('showInactive') === 'true';

    const user = locals.user;
    const isAdmin = user?.role === 'admin';

    // Only admins can see inactive links
    const onlyActive = !showInactive || !isAdmin;

    const db = getDb(locals.runtime);
    const links = await getAllSiteLinks(db, onlyActive);

    return new Response(JSON.stringify({ links }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching site links:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch site links' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/site-links - Create new link (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    // Validate input
    const validationResult = createSiteLinkSchema.safeParse(body);
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

    // Check active links limit
    if (validationResult.data.isActive !== false) {
      const [{ count: activeCount }] = await db
        .select({ count: count() })
        .from(siteLinks)
        .where(eq(siteLinks.isActive, true));
      if (activeCount >= MAX_ACTIVE_LINKS) {
        return new Response(
          JSON.stringify({ error: `Solo puedes tener máximo ${MAX_ACTIVE_LINKS} enlaces activos` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Auto-assign order if not provided (highest + 1)
    let order = validationResult.data.order;
    if (order === undefined) {
      const existingLinks = await getAllSiteLinks(db, false);
      order = existingLinks.length > 0 ? Math.max(...existingLinks.map((l) => l.order)) + 1 : 0;
    }

    const link = await createSiteLink(db, {
      ...validationResult.data,
      order,
    });

    return new Response(JSON.stringify({ link }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating site link:', error);
    return new Response(JSON.stringify({ error: 'Failed to create site link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
