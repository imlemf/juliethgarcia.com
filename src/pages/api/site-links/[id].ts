import type { APIRoute } from 'astro';
import { eq, count } from 'drizzle-orm';
import { getDb, siteLinks } from '@/lib/db';
import { getSiteLinkById, updateSiteLink, deleteSiteLink, getAllSiteLinks } from '@/lib/db/queries/site-links';
import { updateSiteLinkSchema } from '@/lib/validations/site-links';

const MAX_ACTIVE_LINKS = 10;

// GET /api/site-links/[id] - Get single link
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Link ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);
    const link = await getSiteLinkById(db, id);

    if (!link) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ link }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching site link:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch site link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/site-links/[id] - Update link (admin only)
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    const user = locals.user;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Link ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    const validationResult = updateSiteLinkSchema.safeParse(body);
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

    const existingLink = await getSiteLinkById(db, id);
    if (!existingLink) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check active links limit and assign last order when activating
    if (validationResult.data.isActive === true && !existingLink.isActive) {
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

      // Place reactivated link at the end
      const activeLinks = await getAllSiteLinks(db, true);
      const maxOrder = activeLinks.length > 0 ? Math.max(...activeLinks.map((l) => l.order)) : -1;
      validationResult.data.order = maxOrder + 1;
    }

    const link = await updateSiteLink(db, id, validationResult.data);

    return new Response(JSON.stringify({ link }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating site link:', error);
    return new Response(JSON.stringify({ error: 'Failed to update site link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/site-links/[id] - Delete link (admin only)
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    const user = locals.user;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Link ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);

    const existingLink = await getSiteLinkById(db, id);
    if (!existingLink) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteSiteLink(db, id);

    return new Response(JSON.stringify({ message: 'Link deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting site link:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete site link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
