import type { StorePageProps } from '../../types';
import { ProductCard } from './ProductCard';

export function StorePage({ config, products }: StorePageProps) {
  return (
    <div className="py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Tienda</h1>

        {products.length === 0 ? (
          <p className="text-center text-gray-600">No hay productos disponibles.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
