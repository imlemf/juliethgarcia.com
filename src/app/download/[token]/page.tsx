import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getDb } from '@/lib/db';
import { getDownloadLinkByToken } from '@/lib/db/queries/downloads';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, AlertCircle, Clock, Lock, Info } from 'lucide-react';
import Link from 'next/link';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface DownloadPageProps {
  params: Promise<{ token: string }>;
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { token } = await params;
  const session = await auth();

  // Get download link from database
  const context = getRequestContext();
  const db = getDb((context.env as any).DB as D1Database);
  const downloadLink = await getDownloadLinkByToken(db, token);

  if (!downloadLink) {
    notFound();
  }

  const now = new Date();
  const isExpired = now > downloadLink.expiresAt;
  const hasReachedLimit = downloadLink.downloadCount >= downloadLink.maxDownloads;
  const isFirstDownload = !downloadLink.firstDownloadCompleted;
  const remainingDownloads = Math.max(0, downloadLink.maxDownloads - downloadLink.downloadCount);

  // Check ownership for authenticated users
  const isOwner = session?.user && (
    downloadLink.purchase.userId === session.user.id ||
    downloadLink.purchase.email === session.user.email
  );

  // Determine if user can download
  const canDownload = !isExpired && !hasReachedLimit && (isFirstDownload || isOwner);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Download className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">{downloadLink.product.name}</CardTitle>
            <CardDescription>
              {isFirstDownload ? 'Tu descarga está lista' : 'Descarga adicional'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Product Info */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h3 className="font-semibold mb-2">Información del producto</h3>
              {downloadLink.product.description && (
                <p className="text-sm text-muted-foreground">{downloadLink.product.description}</p>
              )}
              {downloadLink.product.fileName && (
                <p className="text-sm">
                  <span className="font-medium">Archivo:</span> {downloadLink.product.fileName}
                </p>
              )}
              {downloadLink.product.fileSize && (
                <p className="text-sm">
                  <span className="font-medium">Tamaño:</span>{' '}
                  {(downloadLink.product.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>

            {/* Download Status */}
            <div className="space-y-3">
              {/* Expired */}
              {isExpired && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-950 p-4">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      Link expirado
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Este link de descarga expiró el {downloadLink.expiresAt.toLocaleDateString()}.
                      Por favor, contacta con soporte para obtener un nuevo link.
                    </p>
                  </div>
                </div>
              )}

              {/* Limit Reached */}
              {!isExpired && hasReachedLimit && (
                <div className="flex items-start gap-3 rounded-lg bg-orange-50 dark:bg-orange-950 p-4">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      Límite de descargas alcanzado
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Has alcanzado el límite de {downloadLink.maxDownloads} descargas para este producto.
                      Contacta con soporte si necesitas más descargas.
                    </p>
                  </div>
                </div>
              )}

              {/* Auth Required */}
              {!isExpired && !hasReachedLimit && !isFirstDownload && !session?.user && (
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                  <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Autenticación requerida
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      Ya usaste tu descarga gratuita. Para descargar nuevamente, necesitas autenticarte.
                    </p>
                    <div className="space-y-2">
                      <Link href={`/auth/required?token=${token}`}>
                        <Button className="w-full" size="sm">
                          Iniciar sesión o registrarse
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Not Owner */}
              {!isExpired && !hasReachedLimit && !isFirstDownload && session?.user && !isOwner && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-950 p-4">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      No autorizado
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      No tienes permiso para descargar este archivo. Este producto pertenece a otra cuenta.
                    </p>
                  </div>
                </div>
              )}

              {/* First Download Info */}
              {!isExpired && !hasReachedLimit && isFirstDownload && (
                <div className="flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Primera descarga gratuita
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Puedes descargar este archivo sin necesidad de crear una cuenta. Para descargas futuras,
                      necesitarás autenticarte con tu código de compra.
                    </p>
                  </div>
                </div>
              )}

              {/* Downloads Info */}
              {!isExpired && !hasReachedLimit && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Descargas disponibles:</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {remainingDownloads} de {downloadLink.maxDownloads}
                  </span>
                </div>
              )}

              {/* Expiry Info */}
              {!isExpired && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Válido hasta:</span>
                  </div>
                  <span className="text-sm">
                    {downloadLink.expiresAt.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Download Button */}
            {canDownload && (
              <div className="space-y-3">
                <form action={`/api/downloads/${token}`} method="GET">
                  <Button type="submit" className="w-full" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    Descargar archivo
                  </Button>
                </form>

                {isFirstDownload && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4">
                    <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-2">
                      Importante: Guarda tu código de compra
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      Revisa tu email para encontrar tu código de compra. Lo necesitarás para crear una cuenta
                      y acceder a descargas adicionales de este producto.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t">
              {session?.user ? (
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Ver mis compras
                  </Button>
                </Link>
              ) : (
                !isFirstDownload && (
                  <Link href={`/auth/required?token=${token}`}>
                    <Button variant="outline" className="w-full">
                      Crear cuenta o iniciar sesión
                    </Button>
                  </Link>
                )
              )}
              <Link href="/products">
                <Button variant="ghost" className="w-full">
                  Continuar comprando
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
