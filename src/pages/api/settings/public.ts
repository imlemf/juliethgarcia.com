import type { APIRoute } from 'astro';
import { getPublicSiteSettings } from '@/lib/settings';

// GET /api/settings/public - Get public settings (no auth required)
// Only returns settings needed for client-side formatting
export const GET: APIRoute = async ({ locals }) => {
  try {
    const settings = await getPublicSiteSettings(locals.runtime);

    return new Response(JSON.stringify({ settings }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return new Response(JSON.stringify({ error: 'Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
