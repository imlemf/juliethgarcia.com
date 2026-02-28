import type { APIRoute } from 'astro';
import { loginWithTurnstile } from '@/lib/auth/helpers';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, password, turnstileToken } = await request.json();

    const result = await loginWithTurnstile(email, password, turnstileToken, locals.runtime);

    if (!result.user) {
      throw new Error('Login failed');
    }

    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
    });

    // Forward all Set-Cookie headers from Better Auth
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
