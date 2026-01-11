import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckoutForm } from '@/components/products/checkout-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// This will fetch the product from the database
// For now, using mock data
async function getProduct(slug: string) {
  // TODO: Fetch from database
  // const db = getDb();
  // const product = await getProductBySlug(db, slug);
  // return product;

  return null; // Placeholder
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  // For development, show placeholder
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/products/${slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al producto
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Checkout</CardTitle>
            <CardDescription>
              Completa tu compra de forma segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            {product ? (
              <CheckoutForm product={product} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Producto en desarrollo
                </p>
                <p className="text-sm text-muted-foreground">
                  El sistema de checkout se completará cuando haya productos en la base de datos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
