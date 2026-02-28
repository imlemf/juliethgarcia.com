import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { incrementClickCount } from '@/lib/db/queries/site-links';

// POST /api/site-links/[id]/click - Track click (public)
export const POST: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Link ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);

    await incrementClickCount(db, id);

    return new Response(JSON.stringify({ message: 'Click tracked' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    // Don't fail the request if tracking fails
    return new Response(JSON.stringify({ message: 'Click tracking failed but continuing' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
