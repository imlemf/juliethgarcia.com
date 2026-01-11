import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Shield, Download } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Productos Digitales de Calidad
          </h1>
          <p className="text-xl text-muted-foreground">
            Descarga instantánea, acceso seguro y soporte completo para todos tus productos digitales
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button size="lg">
                Explorar productos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-gray-50 dark:bg-gray-900 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Descarga Instantánea</h3>
              <p className="text-muted-foreground">
                Accede a tus productos inmediatamente después de la compra
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">100% Seguro</h3>
              <p className="text-muted-foreground">
                Transacciones protegidas y links de descarga únicos
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Productos de Calidad</h3>
              <p className="text-muted-foreground">
                Contenido digital cuidadosamente seleccionado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-bold">
            ¿Listo para comenzar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Explora nuestra colección de productos digitales
          </p>
          <Link href="/products">
            <Button size="lg">
              Ver productos disponibles
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
