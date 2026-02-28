import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = createAuth(locals.runtime);
    const result = await auth.api.signOut({
      headers: request.headers,
    });

    // Better Auth returns a Response object
    if (result instanceof Response) {
      return result;
    }

    // Fallback: manually clear cookies
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
      },
    });
  } catch (error: any) {
    // On error, still try to clear the cookie
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
      },
    });
  }
};
