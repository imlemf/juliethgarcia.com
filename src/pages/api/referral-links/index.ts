import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getAllReferralLinks, createReferralLink } from '@/lib/db/queries/referral-links';
import { createReferralLinkSchema } from '@/lib/validations/referral';

// GET /api/referral-links - List links
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const onlyActive = url.searchParams.get('onlyActive') === 'true';

    const db = getDb(locals.runtime);
    const links = await getAllReferralLinks(db, onlyActive);

    return new Response(JSON.stringify({ links }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching referral links:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener links' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/referral-links - Create link (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validationResult = createReferralLinkSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Datos inválidos',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const db = getDb(locals.runtime);
    const link = await createReferralLink(db, validationResult.data);

    return new Response(JSON.stringify({ link }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating referral link:', error);
    const message = error instanceof Error ? error.message : 'Error al crear link';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
