import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getReferralLinkBySlug, trackClick } from '@/lib/db/queries/referral-links';
import { buildDestinationUrlWithUtm } from '@/lib/validations/referral';

export const GET: APIRoute = async ({ params, request, locals, redirect }) => {
  try {
    const { slug } = params;
    if (!slug) {
      return new Response('Link no encontrado', { status: 404 });
    }

    const db = getDb(locals.runtime);
    const link = await getReferralLinkBySlug(db, slug);

    if (!link || !link.isActive) {
      return new Response('Link no encontrado', { status: 404 });
    }

    // Extract tracking data from request headers (Cloudflare provides these)
    const url = new URL(request.url);
    const clickData = {
      country: request.headers.get('cf-ipcountry') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      referer: request.headers.get('referer') || undefined,
      ipAddress: request.headers.get('cf-connecting-ip') || undefined,
      // Capture incoming UTM params (where the user came from)
      incomingUtmSource: url.searchParams.get('utm_source') || undefined,
      incomingUtmMedium: url.searchParams.get('utm_medium') || undefined,
      incomingUtmCampaign: url.searchParams.get('utm_campaign') || undefined,
    };

    // Track click asynchronously using waitUntil (Cloudflare Workers)
    const ctx = locals.runtime?.ctx;
    if (ctx?.waitUntil) {
      ctx.waitUntil(trackClick(db, link.id, clickData));
    } else {
      // Fallback for non-Cloudflare environments
      await trackClick(db, link.id, clickData);
    }

    // Build destination URL with configured UTM params
    const destinationUrl = buildDestinationUrlWithUtm(link.destinationUrl, {
      utmSource: link.utmSource,
      utmMedium: link.utmMedium,
      utmCampaign: link.utmCampaign,
      utmTerm: link.utmTerm,
      utmContent: link.utmContent,
    });

    // Redirect to affiliate link
    return redirect(destinationUrl, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    return new Response('Error del servidor', { status: 500 });
  }
};
