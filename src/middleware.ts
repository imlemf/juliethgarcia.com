import { defineMiddleware } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';
import { checkRateLimit, RateLimits } from '@/lib/security/rate-limit';

export const onRequest: MiddlewareHandler = defineMiddleware(async (context, next) => {
  const { request, locals, url, redirect } = context;

  // 1. Validate session with Better Auth
  // locals.runtime is injected by @astrojs/cloudflare platformProxy
  let session = null;
  try {
    const runtime = locals.runtime;
    if (runtime?.env?.DB) {
      const { createAuth } = await import('@/lib/auth/auth');
      const auth = createAuth(runtime);
      session = await auth.api.getSession({
        headers: request.headers,
      });
    }
  } catch (error) {
    console.error('[Middleware] Auth error:', error);
  }

  locals.user = session?.user || null;
  locals.session = session?.session || null;

  // 2. Rate limiting
  let rateLimitConfig;
  const pathname = url.pathname;

  if (pathname.startsWith('/api/payments/create-preference')) {
    rateLimitConfig = RateLimits.PAYMENT;
  } else if (pathname.startsWith('/api/payments/webhook')) {
    rateLimitConfig = RateLimits.WEBHOOK;
  } else if (pathname.startsWith('/api/')) {
    rateLimitConfig = RateLimits.API;
  }

  if (rateLimitConfig) {
    const rateLimitResult = checkRateLimit(request, rateLimitConfig);
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }
  }

  // 3. Protected routes
  const isAdminLogin = pathname === '/admin/login';
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) && !locals.user && !isAdminLogin) {
    return redirect(`/admin/login?callbackUrl=${pathname}`);
  }

  if (pathname === '/my-purchases' && !locals.user) {
    return redirect('/login?redirect=/my-purchases');
  }

  // 4. Admin-only routes (excluding /admin/login)
  if (pathname.startsWith('/admin') && !isAdminLogin && locals.user?.role !== 'admin') {
    return redirect('/dashboard');
  }

  // 5. Security headers
  const response = await next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://sdk.mercadopago.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.mercadopago.com https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com https://www.mercadopago.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.mercadopago.com",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ')
  );

  return response;
});
