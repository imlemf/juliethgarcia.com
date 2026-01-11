import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getDb } from '@/lib/db';
import { getDownloadLinkByToken, updateDownloadLink } from '@/lib/db/queries/downloads';
import { generatePresignedDownloadUrl } from '@/lib/r2/download';

export const runtime = 'edge';

// GET /api/downloads/[token] - Download file with token validation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth();

    // Get download link from database
    const db = getDb((request as any).env?.DB);
    const downloadLink = await getDownloadLinkByToken(db, token);

    if (!downloadLink) {
      return NextResponse.json(
        { error: 'Link de descarga no encontrado' },
        { status: 404 }
      );
    }

    // Check if link has expired
    const now = new Date();
    if (now > downloadLink.expiresAt) {
      return NextResponse.json(
        { error: 'El link de descarga ha expirado' },
        { status: 410 }
      );
    }

    // Check if this is the first download (no auth required)
    if (!downloadLink.firstDownloadCompleted) {
      // First download - allow without authentication
      console.log('First download - no auth required');

      // Generate presigned R2 URL (valid for 1 hour)
      const presignedUrl = await generatePresignedDownloadUrl(
        downloadLink.product.fileKey,
        3600
      );

      // Update download link
      await updateDownloadLink(db, downloadLink.id, {
        firstDownloadCompleted: true,
        firstDownloadAt: new Date(),
        downloadCount: downloadLink.downloadCount + 1,
        lastDownloadedAt: new Date(),
        ipAddress: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      // Redirect to presigned R2 URL
      return NextResponse.redirect(presignedUrl);
    }

    // Subsequent downloads - require authentication
    console.log('Subsequent download - auth required');

    if (!session || !session.user) {
      // Not authenticated - redirect to auth required page
      const authRequiredUrl = new URL('/auth/required', request.url);
      authRequiredUrl.searchParams.set('token', token);
      return NextResponse.redirect(authRequiredUrl);
    }

    // Validate ownership
    // User must own this purchase (either by userId or by email match)
    const isOwner =
      downloadLink.purchase.userId === session.user.id ||
      downloadLink.purchase.email === session.user.email;

    if (!isOwner) {
      return NextResponse.json(
        { error: 'No tienes permiso para descargar este archivo' },
        { status: 403 }
      );
    }

    // Check download limit
    if (downloadLink.downloadCount >= downloadLink.maxDownloads) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${downloadLink.maxDownloads} descargas para este producto` },
        { status: 429 }
      );
    }

    // Generate presigned R2 URL (valid for 1 hour)
    const presignedUrl = await generatePresignedDownloadUrl(
      downloadLink.product.fileKey,
      3600
    );

    // Update download tracking
    await updateDownloadLink(db, downloadLink.id, {
      downloadCount: downloadLink.downloadCount + 1,
      lastDownloadedAt: new Date(),
      ipAddress: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      userId: session.user.id, // Link user to download link if not already
    });

    // Redirect to presigned R2 URL
    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la descarga' },
      { status: 500 }
    );
  }
}
