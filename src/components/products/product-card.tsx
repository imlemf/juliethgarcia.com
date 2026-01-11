import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format-currency';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full">
      {product.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-2xl font-bold">
          {formatCurrency(product.price / 100, product.currency)}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/products/${product.slug}`} className="w-full">
          <Button className="w-full">
            Ver detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
