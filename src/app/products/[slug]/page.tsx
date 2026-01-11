import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // This will be populated with actual product data in the future
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Producto</CardTitle>
            <CardDescription>
              Detalles del producto digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Slug: {slug}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              La página de detalle de producto se completará en la siguiente fase
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
