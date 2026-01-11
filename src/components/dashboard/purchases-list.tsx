import { Download, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string | null;
  fileName: string | null;
  fileSize: number | null;
}

interface DownloadLink {
  id: string;
  token: string;
  expiresAt: Date | null;
  downloadCount: number;
  maxDownloads: number;
  firstDownloadCompleted: boolean;
}

interface Purchase {
  id: string;
  purchaseCode: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  createdAt: Date | null;
  product: Product;
  downloadLinks: DownloadLink[];
}

interface PurchasesListProps {
  purchases: Purchase[];
}

export function PurchasesList({ purchases }: PurchasesListProps) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Aún no tienes compras</p>
        <Link href="/products">
          <Button>Explorar productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => {
        const downloadLink = purchase.downloadLinks[0]; // Each purchase has one download link
        const now = new Date();
        const isExpired = downloadLink && downloadLink.expiresAt ? now > downloadLink.expiresAt : false;
        const hasReachedLimit = downloadLink ? downloadLink.downloadCount >= downloadLink.maxDownloads : false;
        const remainingDownloads = downloadLink ? Math.max(0, downloadLink.maxDownloads - downloadLink.downloadCount) : 0;
        const canDownload = downloadLink && !isExpired && !hasReachedLimit;

        return (
          <Card key={purchase.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{purchase.product.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Comprado el {purchase.createdAt?.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) || 'Fecha desconocida'}
                  </CardDescription>
                </div>
                {purchase.status === 'completed' && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completado
                  </Badge>
                )}
                {purchase.status === 'pending' && (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchase.product.description && (
                <p className="text-sm text-muted-foreground">{purchase.product.description}</p>
              )}

              {downloadLink && (
                <div className="space-y-3">
                  {/* Download Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Descargas</p>
                        <p className="text-sm font-semibold">
                          {remainingDownloads} de {downloadLink.maxDownloads}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Válido hasta</p>
                        <p className="text-sm font-semibold">
                          {isExpired ? (
                            <span className="text-destructive">Expirado</span>
                          ) : (
                            downloadLink.expiresAt?.toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                            }) || 'N/A'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {isExpired && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                      <p className="text-sm text-red-900 dark:text-red-100">
                        Link de descarga expirado. Contacta con soporte para renovarlo.
                      </p>
                    </div>
                  )}

                  {!isExpired && hasReachedLimit && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <p className="text-sm text-orange-900 dark:text-orange-100">
                        Límite de descargas alcanzado. Contacta con soporte si necesitas más descargas.
                      </p>
                    </div>
                  )}

                  {/* Download Button */}
                  {canDownload ? (
                    <Link href={`/download/${downloadLink.token}`} className="block">
                      <Button className="w-full" size="lg">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar producto
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      {isExpired ? 'Link expirado' : 'Límite alcanzado'}
                    </Button>
                  )}
                </div>
              )}

              {/* Purchase Details */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Código de compra:</span>
                  <span className="font-mono font-semibold">{purchase.purchaseCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto pagado:</span>
                  <span className="font-semibold">
                    {purchase.currency} ${(purchase.amount / 100).toFixed(2)}
                  </span>
                </div>
                {purchase.product.fileName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Archivo:</span>
                    <span className="font-medium">{purchase.product.fileName}</span>
                  </div>
                )}
                {purchase.product.fileSize && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tamaño:</span>
                    <span className="font-medium">
                      {(purchase.product.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
