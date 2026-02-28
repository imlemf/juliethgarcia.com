import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { subscribeToNewsletter } from '@/lib/db/queries/newsletter';
import { validateTurnstile } from '@/lib/auth/turnstile';
import { handleApiError, ErrorResponses } from '@/lib/utils/error-handler';

const subscribeSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.enum(['CO', 'US', 'MX']).optional(),
  turnstileToken: z.string().min(1, 'Token de verificación requerido'),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    // Validate input
    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Datos inválidos',
          details: result.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { email, name, phone, countryCode, turnstileToken } = result.data;

    // Validate Turnstile token
    const turnstileValidation = await validateTurnstile(turnstileToken);
    if (!turnstileValidation.success) {
      throw ErrorResponses.forbidden(turnstileValidation.error || 'Verificación anti-bot fallida');
    }

    // Get client info
    const ipAddress =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Subscribe to newsletter
    const db = getDb(locals.runtime);
    const { subscriber, created } = await subscribeToNewsletter(db, {
      email,
      name,
      phone,
      countryCode,
      ipAddress,
      userAgent,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: created
          ? 'Te has suscrito exitosamente al newsletter'
          : 'Ya estás suscrito al newsletter',
        email: subscriber.email,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
