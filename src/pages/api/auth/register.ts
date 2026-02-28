import type { APIRoute } from 'astro';
import { registerWithPurchaseCode } from '@/lib/auth/helpers';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, purchaseCode, password, turnstileToken } = await request.json();

    const result = await registerWithPurchaseCode(
      email,
      purchaseCode,
      password,
      turnstileToken,
      locals.runtime
    );

    if (!result.user) {
      throw new Error('Registration failed');
    }

    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
    });

    if (result.headers) {
      const cookies = result.headers.getSetCookie?.() || [];
      for (const cookie of cookies) {
        responseHeaders.append('Set-Cookie', cookie);
      }
    }

    return new Response(JSON.stringify({ success: true, user: result.user }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
