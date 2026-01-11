import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Mail, Download } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl">¡Compra exitosa!</CardTitle>
            <CardDescription className="text-base">
              Tu pago ha sido procesado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Revisa tu email
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Hemos enviado un email con:
                  </p>
                  <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1">
                    <li>Tu código de compra único</li>
                    <li>Link de descarga directo</li>
                    <li>Instrucciones para descargas adicionales</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    Próximos pasos
                  </h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Haz clic en el link del email para tu primera descarga (gratis, sin registro)</li>
                    <li>Para descargar nuevamente, usa tu código de compra para crear una cuenta</li>
                    <li>Si ya tienes cuenta, solo inicia sesión para acceder a tus compras</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full" variant="default">
                  Crear cuenta / Iniciar sesión
                </Button>
              </Link>
              <Link href="/products" className="block">
                <Button className="w-full" variant="outline">
                  Continuar comprando
                </Button>
              </Link>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              ¿No recibiste el email? Revisa tu carpeta de spam o contacta con soporte
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
