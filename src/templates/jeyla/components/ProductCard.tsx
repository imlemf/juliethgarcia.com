import type { ProductCardProps } from '../../types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: product.currency,
    minimumFractionDigits: 0,
  }).format(product.price / 100);

  return (
    <a
      href={`/store/${product.slug}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {product.imageUrl && (
        <div className="aspect-video bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description ? stripHtml(product.description) : ''}</p>
        <p className="text-2xl font-bold">{formattedPrice}</p>
      </div>
    </a>
  );
}
