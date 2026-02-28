import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getDownloadLinkByToken, updateDownloadLink } from '@/lib/db/queries/downloads';
import { checkRateLimit, RateLimits } from '@/lib/security/rate-limit';

/**
 * Render a friendly error page with Jeyla's pastel aesthetic.
 */
function errorPage(title: string, message: string, status: number): Response {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FFF8F5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .card { background: rgba(255,255,255,0.9); border-radius: 1.5rem; padding: 3rem; max-width: 28rem; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(255,214,232,0.25); }
    .icon { width: 5rem; height: 5rem; border-radius: 50%; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; background: rgba(230,230,250,0.4); }
    .icon svg { width: 2.5rem; height: 2.5rem; stroke: #5A4A42; fill: none; stroke-width: 1.5; }
    h1 { color: #5A4A42; font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: #8B7D77; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    a { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 500; text-decoration: none; font-size: 0.9rem; transition: transform 0.2s; }
    a:hover { transform: scale(1.05); }
    .primary { background: #C7EAE4; color: #5A4A42; }
    .secondary { background: rgba(230,230,250,0.4); color: #5A4A42; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="actions">
      <a href="/my-purchases" class="primary">Mis compras</a>
      <a href="/" class="secondary">Inicio</a>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status,
    headers: new Headers({ 'Content-Type': 'text/html; charset=utf-8' }),
  });
}

/**
 * Serve file directly from R2 binding (works both locally via miniflare and in production).
 */
async function serveFileFromR2(
  locals: App.Locals,
  fileKey: string,
  fileName: string
): Promise<Response> {
  const r2Bucket = (locals.runtime.env as any).R2_BUCKET as R2Bucket;
  const object = await r2Bucket.get(fileKey);

  if (!object) {
    return errorPage(
      'Archivo no encontrado',
      'El archivo asociado a esta descarga no fue encontrado. Por favor contacta a soporte.',
      404
    );
  }

  // Clone into a new Response with mutable headers so middleware can add security headers
  const response = new Response(object.body, {
    headers: new Headers({
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    }),
  });
  return response;
}

export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    const { token } = params;
    const user = locals.user;

    if (!token) {
      return errorPage('Enlace inválido', 'El enlace de descarga no es válido.', 400);
    }

    const db = getDb(locals.runtime);
    const downloadLink = await getDownloadLinkByToken(db, token);

    if (!downloadLink) {
      return errorPage(
        'Enlace no encontrado',
        'Este enlace de descarga no existe o ya no está disponible.',
        404
      );
    }

    // Check expiry
    const now = new Date();
    if (now > downloadLink.expiresAt) {
      return errorPage(
        'Enlace expirado',
        'Este enlace de descarga ha expirado. Revisa tu email o contacta a soporte para obtener uno nuevo.',
        410
      );
    }

    const ipAddress =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Authenticated user - validate ownership, then unlimited downloads
    if (user) {
      const isOwner =
        downloadLink.purchase.userId === user.id || downloadLink.purchase.email === user.email;

      if (!isOwner) {
        return errorPage(
          'Sin permiso',
          'No tienes permiso para descargar este archivo. Asegúrate de haber iniciado sesión con la cuenta correcta.',
          403
        );
      }

      // Authenticated owner: unlimited downloads, no rate limit
      await updateDownloadLink(db, downloadLink.id, {
        downloadCount: downloadLink.downloadCount + 1,
        lastDownloadedAt: new Date(),
        ipAddress,
        userAgent,
        userId: user.id,
      });

      return serveFileFromR2(
        locals,
        downloadLink.product.fileKey,
        downloadLink.product.fileName
      );
    }

    // Public (no auth): allowed up to maxDownloads, then require login
    if (downloadLink.downloadCount >= downloadLink.maxDownloads) {
      return new Response(null, {
        status: 302,
        headers: new Headers({
          Location: `/login?redirect=/downloads/${token}`,
        }),
      });
    }

    // Rate limit for public downloads only
    const rateLimitResult = checkRateLimit(request, RateLimits.DOWNLOAD);
    if (!rateLimitResult.success) {
      const minutes = Math.ceil((rateLimitResult.reset - Date.now()) / 60000);
      return errorPage(
        'Demasiadas descargas',
        `Has realizado muchas descargas en poco tiempo. Por favor espera ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} e intenta de nuevo.`,
        429
      );
    }

    // Public download
    await updateDownloadLink(db, downloadLink.id, {
      downloadCount: downloadLink.downloadCount + 1,
      lastDownloadedAt: new Date(),
      ipAddress,
      userAgent,
    });

    return serveFileFromR2(
      locals,
      downloadLink.product.fileKey,
      downloadLink.product.fileName
    );
  } catch (error) {
    console.error('Download error:', error);
    return errorPage(
      'Error inesperado',
      'Ocurrió un error al procesar tu descarga. Por favor intenta de nuevo más tarde.',
      500
    );
  }
};
