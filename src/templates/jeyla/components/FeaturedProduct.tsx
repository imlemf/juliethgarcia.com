interface FeaturedProductProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string | null;
  };
  colors: {
    pink: string;
    mint: string;
    greenMint: string;
    textDark: string;
    textMedium: string;
  };
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price / 100);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function FeaturedProduct({ product, colors }: FeaturedProductProps) {
  return (
    <a href={`/checkout/${product.slug}`} className="group block w-full max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-8 transition-all duration-500 group-hover:scale-[1.02]">
        {/* Image */}
        <div className="relative flex-shrink-0">
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: colors.textDark }}
          >
            {product.name}
          </h3>
          {product.description && (
            <p
              className="mb-4 line-clamp-2 text-sm"
              style={{ color: colors.textMedium }}
            >
              {stripHtml(product.description)}
            </p>
          )}
          <span
            className="text-3xl font-bold"
            style={{ color: colors.textDark }}
          >
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
      </div>
    </a>
  );
}
